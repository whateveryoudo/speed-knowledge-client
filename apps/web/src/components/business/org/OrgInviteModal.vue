<template>
  <a-modal
    :open="visible"
    title="链接邀请成员"
    :footer="null"
    :width="420"
    destroy-on-close
    @cancel="handleClose"
  >
    <a-spin :spinning="loading">
      <div class="py-2">
        <p class="text-[var(--sd-text-caption)] text-[14px] mb-4">
          通过链接邀请成员，访问链接即可加入{{ orgLabel }}：
        </p>

        <!-- 第一行：部门选择树 + 复制链接按钮 -->
        <a-flex align="center" gap="middle" class="mb-6">
          <a-tree-select
            v-model:value="settings.default_dept_id"
            :tree-data="departmentTree"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择部门"
            tree-default-expand-all
            class="flex-1"
            :disabled="updating"
            @change="handleDeptChange"
          />
          <a-button
            type="primary"
            class="px-6 h-[34px] rounded-[6px]"
            @click="handleCopyLink"
          >
            复制链接
          </a-button>
        </a-flex>

        <!-- 更多设置：优先使用 a-flex 布局，颜色遵循 var.css 与 antd 变量 -->
        <div class="mt-5 pt-3">
          <div class="text-[13px] text-[var(--sd-text-caption)] mb-3">更多设置</div>

          <div class="space-y-4">
            <!-- 默认角色 -->
            <a-flex justify="space-between" align="center">
              <span>默认分配角色</span>
              <a-select
                v-model:value="settings.default_role"
                class="w-[120px]"
                :disabled="updating"
                @change="handleRoleChange"
              >
                <a-select-option value="member">普通成员</a-select-option>
                <a-select-option value="admin">管理员</a-select-option>
              </a-select>
            </a-flex>

            <!-- 审批确认 -->
            <a-flex justify="space-between" align="center">
              <span>提交申请后需审批确认</span>
              <a-switch
                v-model:checked="settings.need_approval"
                :disabled="updating"
                @change="handleApprovalChange"
              />
            </a-flex>

            <!-- 重置链接 -->
            <a-flex justify="space-between" align="center">
              <span>重置链接</span>
              <a-popconfirm
                title="确定要重置邀请链接吗？"
                description="重置后，之前发出的邀请链接将立即失效。"
                ok-text="确认重置"
                cancel-text="取消"
                ok-type="danger"
                @confirm="handleResetToken"
              >
                <a-button
                  type="link"
                  class="!px-0 !text-[var(--sd-text-body)] hover:!text-[var(--sd-link-color)]"
                >
                  <ReloadOutlined class="text-[13px]" />
                  立即重置
                </a-button>
              </a-popconfirm>
            </a-flex>
          </div>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@vueuse/core'
import { orgInvitation as orgInvitationApi } from '@sk/api'
import { to } from 'await-to-js'
import { OrgType, type SpaceDepartmentItem, type OrgInvitationResponse } from '@sk/types'
import { getMainOrigin } from '#sk-web/store/useSpaceStore'

const props = withDefaults(
  defineProps<{
    visible: boolean
    orgType?: OrgType | string
    orgId: string
    orgName?: string
    defaultDeptId?: string | null
    departmentTree?: SpaceDepartmentItem[]
  }>(),
  {
    orgType: OrgType.SPACE,
    orgName: '',
    defaultDeptId: null,
    departmentTree: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const { copy } = useClipboard()

const loading = ref(false)
const updating = ref(false)
const invitationData = ref<OrgInvitationResponse | null>(null)

const settings = reactive({
  default_role: 'member',
  default_dept_id: undefined as string | undefined,
  need_approval: false,
})

const orgLabel = computed(() => {
  return props.orgType === OrgType.TEAM || props.orgType === 'team' ? '团队' : '空间'
})

// 生成完整的邀请访问链接（使用平台主域名，避免子域名权限隔离或未加入直接403）
const inviteUrl = computed(() => {
  if (!invitationData.value?.token) return ''
  const mainOrigin = getMainOrigin()
  return `${mainOrigin}/invite/org?token=${invitationData.value.token}`
})

// 初始化或获取邀请配置
const initInvitation = async () => {
  if (!props.orgId) return
  loading.value = true

  // 初次初始化部门：优先使用外部传入的当前部门，或取部门树根节点
  const initialDeptId =
    settings.default_dept_id ||
    props.defaultDeptId ||
    props.departmentTree?.[0]?.id ||
    undefined

  if (!settings.default_dept_id && initialDeptId) {
    settings.default_dept_id = initialDeptId
  }

  const [err, res] = await to(
    orgInvitationApi.getOrInitMyInvitation(props.orgType, props.orgId, {
      default_role: settings.default_role,
      default_dept_id: settings.default_dept_id,
      need_approval: settings.need_approval,
    }),
  )
  loading.value = false
  if (err || !res?.data) {
    return
  }

  invitationData.value = res.data
  settings.default_role = res.data.default_role || 'member'
  settings.default_dept_id = res.data.default_dept_id || initialDeptId || undefined
  settings.need_approval = !!res.data.need_approval
}

// 保存配置变动
const saveSettings = async () => {
  if (!invitationData.value?.token) return
  updating.value = true
  const [err, res] = await to(
    orgInvitationApi.saveInvitationSettings(invitationData.value.token, {
      default_role: settings.default_role,
      default_dept_id: settings.default_dept_id,
      need_approval: settings.need_approval,
    }),
  )
  updating.value = false
  if (!err && res?.data) {
    invitationData.value = res.data
    message.success('邀请设置已更新')
  }
}

const handleRoleChange = () => {
  saveSettings()
}

const handleDeptChange = () => {
  saveSettings()
}

const handleApprovalChange = () => {
  saveSettings()
}

// 复制邀请链接
const handleCopyLink = async () => {
  if (!inviteUrl.value) {
    message.warning('邀请链接正在生成中，请稍候')
    return
  }
  await copy(inviteUrl.value)
  message.success('邀请链接已复制到剪贴板')
}

// 重置邀请链接
const handleResetToken = async () => {
  if (!invitationData.value?.token) return
  loading.value = true
  const [err, res] = await to(orgInvitationApi.resetInvitationToken(invitationData.value.token))
  loading.value = false
  if (!err && res?.data) {
    invitationData.value = res.data
    message.success('邀请链接已重置')
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.orgId) {
      initInvitation()
    }
  },
  { immediate: true },
)
</script>
