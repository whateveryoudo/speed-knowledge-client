<template>
  <a-modal
    :open="visible"
    title="转让空间所有权"
    :confirm-loading="loading"
    ok-text="确认转让"
    :ok-button-props="{ danger: true, disabled: !selectedTargetUserId || candidateMembers.length === 0 }"
    cancel-text="取消"
    width="520px"
    destroy-on-close
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="py-2 space-y-4">
      <!-- 警告提示条 -->
      <a-alert
        message="所有权转移风险提示"
        description="转让空间后，目标成员将成为新的空间所有者，并获得最高管理权限。转让完成后，你将无法单方面收回所有权。"
        type="warning"
        show-icon
        class="rounded-[6px]"
      />

      <!-- 如果空间只有一个人，展示空状态提示 -->
      <div
        v-if="!loadingCandidates && candidateMembers.length === 0"
        class="py-8 px-4 text-center bg-gray-50 rounded-[8px] border border-dashed border-gray-200"
      >
        <a-empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          description="暂无可转让成员"
        >
        </a-empty>
      </div>

      <!-- 有可选成员时，展示转让表单 -->
      <a-form v-else layout="vertical" class="mt-3">
        <!-- 目标成员选择器 -->
        <a-form-item label="选择新所有者" required extra="只能转让给空间内在职的正式成员">
          <a-select
            v-model:value="selectedTargetUserId"
            show-search
            placeholder="请选择或搜索要转让给的成员"
            :filter-option="filterMemberOption"
            :loading="loadingCandidates"
            class="w-full"
            size="large"
          >
            <template #notFoundContent>
              <div class="py-2 text-center text-gray-400 text-[12px]">暂无可转让成员</div>
            </template>
            <a-select-option
              v-for="member in candidateMembers"
              :key="member.user?.id"
              :value="member.user?.id"
              :label="`${member.user?.nickname || ''} ${member.user?.username || ''}`"
            >
              <div class="flex items-center justify-between w-full py-1">
                <div class="flex items-center gap-2.5 min-w-0">
                  <a-avatar
                    :src="resolveSpaceIconUrl(member.user?.avatar, AvatarDef)"
                    size="small"
                    class="shrink-0"
                  >
                    {{ (member.user?.nickname || member.user?.username || 'U')[0].toUpperCase() }}
                  </a-avatar>
                  <span class="font-medium text-gray-800 text-[13px] truncate">
                    {{ member.user?.nickname || member.user?.username }}
                  </span>
                  <span class="text-gray-400 text-[12px] truncate">
                    @{{ member.user?.username }}
                  </span>
                </div>
                <div class="shrink-0 ml-2">
                  <span
                    v-if="member.role === SpaceMemberRole.ADMIN"
                    class="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-solid border-blue-200"
                  >
                    管理员
                  </span>
                  <span
                    v-else
                    class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                  >
                    成员
                  </span>
                </div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- 选中目标成员后的小提示卡片 -->
        <div
          v-if="selectedMemberInfo"
          class="p-3 bg-gray-50 rounded-[8px] border border-solid border-gray-200 flex items-center justify-between -mt-2 mb-3"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <a-avatar
              :src="resolveSpaceIconUrl(selectedMemberInfo.user?.avatar, AvatarDef)"
              size="default"
              class="shrink-0"
            >
              {{ (selectedMemberInfo.user?.nickname || selectedMemberInfo.user?.username || 'U')[0].toUpperCase() }}
            </a-avatar>
            <div class="min-w-0">
              <div class="text-[13px] font-medium text-gray-900 truncate">
                {{ selectedMemberInfo.user?.nickname || selectedMemberInfo.user?.username }}
              </div>
              <div class="text-[11px] text-gray-500">
                所属部门：{{ selectedMemberInfo.department_names?.join(', ') || '未分配' }}
              </div>
            </div>
          </div>
          <span class="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-solid border-emerald-200 font-medium">
            即将成为空间所有者
          </span>
        </div>

        <!-- 转让后是否退出空间 -->
        <a-form-item label="转让后你的去向" required>
          <a-radio-group v-model:value="exitSpace" class="w-full grid grid-cols-2 gap-3">
            <a-radio-button :value="false" class="!h-auto !py-2.5 !px-3 !rounded-[6px] text-center">
              <div class="font-medium text-[13px]">留在空间</div>
              <div class="text-[11px] text-gray-400 mt-0.5">继续参与空间协作</div>
            </a-radio-button>
            <a-radio-button :value="true" class="!h-auto !py-2.5 !px-3 !rounded-[6px] text-center">
              <div class="font-medium text-[13px] text-red-500">退出空间</div>
              <div class="text-[11px] text-gray-400 mt-0.5">立即移交并离开</div>
            </a-radio-button>
          </a-radio-group>
        </a-form-item>

        <!-- 如果留在空间，选择保留的角色 -->
        <a-form-item v-if="!exitSpace" label="转让后你在空间的角色" required>
          <a-radio-group v-model:value="targetRoleIfStay" class="w-full flex flex-col gap-2">
            <a-radio :value="SpaceMemberRole.ADMIN">
              <span class="text-[13px] font-medium text-gray-800">管理员</span>
              <span class="text-[12px] text-gray-400 ml-2">（推荐，可协助继续管理团队和知识库）</span>
            </a-radio>
            <a-radio :value="SpaceMemberRole.MEMBER">
              <span class="text-[13px] font-medium text-gray-800">普通成员</span>
              <span class="text-[12px] text-gray-400 ml-2">（降为常规协作成员）</span>
            </a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 如果选择退出空间，展示警示文案 -->
        <div
          v-else
          class="text-[12px] text-red-600 bg-red-50 p-2.5 rounded-[6px] border border-solid border-red-200 leading-relaxed"
        >
          你将退出该空间并进入已离职名单，名下所属部门关系将解除。如需重新进入，需由新管理员重新邀请。
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { message, Empty } from 'ant-design-vue'
import { space as spaceApi } from '@sk/api'
import { SpaceMemberRole, type SpaceMemberListItem } from '@sk/types'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'
import AvatarDef from '#sk-web/assets/images/avatar_def.png'

const props = defineProps<{
  visible: boolean
  currentUserId?: number
  preSelectedMember?: SpaceMemberListItem | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success', exitSpace: boolean): void
}>()

const loading = ref(false)
const loadingCandidates = ref(false)
const candidateMembers = ref<SpaceMemberListItem[]>([])
const selectedTargetUserId = ref<number | null>(null)
const exitSpace = ref(false)
const targetRoleIfStay = ref<SpaceMemberRole>(SpaceMemberRole.ADMIN)

// 选中目标成员的详细对象
const selectedMemberInfo = computed(() => {
  if (!selectedTargetUserId.value) return null
  return candidateMembers.value.find((m) => m.user?.id === selectedTargetUserId.value) || null
})

// 加载可转让的在职成员名单
const fetchCandidates = async () => {
  loadingCandidates.value = true
  try {
    const res = await spaceApi.listSpaceMembers({
      tab: 'member',
      page: 1,
      page_size: 100,
    })
    const items = res.data?.items || []
    // 排除自己，且排除外部临时联系人
    candidateMembers.value = items.filter((item) => {
      const isMe = props.currentUserId !== undefined && item.user?.id === props.currentUserId
      const isExternal = item.role === SpaceMemberRole.EXTERNAL
      return !isMe && !isExternal
    })
  } catch {
    message.error('加载可转让成员列表失败')
  } finally {
    loadingCandidates.value = false
  }
}

// 模糊搜索过滤
const filterMemberOption = (input: string, option: any) => {
  const label = (option?.label || '').toLowerCase()
  return label.includes(input.toLowerCase())
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      exitSpace.value = false
      targetRoleIfStay.value = SpaceMemberRole.ADMIN
      loading.value = false

      // 如果有预选人员，则默认选中
      if (props.preSelectedMember?.user?.id) {
        selectedTargetUserId.value = props.preSelectedMember.user.id
      } else {
        selectedTargetUserId.value = null
      }

      fetchCandidates()
    }
  },
)

const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = async () => {
  if (!selectedTargetUserId.value) {
    message.warning('请先选择要转让的新所有者')
    return
  }

  loading.value = true
  try {
    await spaceApi.transferSpaceOwner({
      target_user_id: selectedTargetUserId.value,
      exit_space: exitSpace.value,
      target_role_if_stay: targetRoleIfStay.value,
    })
    message.success('空间所有权转让成功')
    emit('update:visible', false)
    emit('success', exitSpace.value)
  } catch (e: any) {
    message.error(e?.response?.data?.detail || '空间所有权转让失败')
  } finally {
    loading.value = false
  }
}
</script>
