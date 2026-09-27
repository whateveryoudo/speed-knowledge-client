<template>
  <a-modal
    :open="open"
    :title="null"
    :footer="null"
    :width="460"
    destroyOnClose
    centered
    class="create-team-modal"
    @cancel="handleCancel"
  >
    <div class="p-2">
      <!-- 头部 -->
      <div class="mb-5 flex items-start justify-between">
        <div>
          <h2 class="m-0 text-[18px] font-semibold text-[var(--sd-text-grey-900)]">新建团队</h2>
          <p class="mt-1 mb-0 text-[13px] text-[var(--sd-text-caption)]">
            和成员一起进行项目协作和知识管理
          </p>
        </div>
      </div>

      <a-form layout="vertical" :model="formState" ref="formRef">
        <!-- 基本信息 -->
        <div class="mb-5">
          <div class="mb-2 text-[14px] font-medium text-[var(--sd-text-grey-900)]">基本信息</div>
          <div class="flex items-center gap-3">
            <div
              class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-solid border-[#e5e7eb] bg-[#f0f5ff] text-[#1677ff]"
            >
              <TeamOutlined class="text-[20px]" />
            </div>
            <a-form-item
              name="name"
              class="mb-0 flex-1"
              :rules="[{ required: true, message: '请输入团队名称', trigger: 'blur' }]"
            >
              <a-input
                v-model:value="formState.name"
                placeholder="团队名称"
                :maxlength="30"
                class="rounded-md"
              />
            </a-form-item>
          </div>
          <div class="mt-3">
            <a-form-item name="description" class="mb-0">
              <a-textarea
                v-model:value="formState.description"
                placeholder="团队简介"
                :rows="3"
                :maxlength="200"
                class="rounded-md"
              />
            </a-form-item>
          </div>
        </div>

        <!-- 添加成员 -->
        <div class="mb-5">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">添加成员</span>
            <span class="text-[12px] text-[#1677ff] cursor-pointer hover:opacity-80">+ 批量添加</span>
          </div>
          <a-input
            v-model:value="memberSearch"
            placeholder="输入成员名字搜索添加"
            class="rounded-md"
          >
            <template #prefix>
              <SearchOutlined class="text-[#9ca3af]" />
            </template>
          </a-input>
          <div class="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--sd-text-caption)]">
            <span>默认包含创建者（自己）</span>
          </div>
        </div>

        <!-- 公开性 -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <div class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">公开性</div>
            <div class="text-[12px] text-[var(--sd-text-caption)]">公开给空间所有成员</div>
          </div>
          <a-switch v-model:checked="isPublicToSpace" />
        </div>

        <!-- 提交按钮 -->
        <a-button
          type="primary"
          block
          size="large"
          class="h-[40px] rounded-lg !bg-[#2ba471] hover:!bg-[#248d61] border-none text-[15px] font-medium"
          :loading="submitting"
          @click="handleSubmit"
        >
          新建
        </a-button>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import { TeamOutlined, SearchOutlined } from '@ant-design/icons-vue'
import to from 'await-to-js'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamItem } from '@sk/types'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  success: [team: TeamItem]
}>()

const spaceStore = useSpaceStore()
const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)
const memberSearch = ref('')
const isPublicToSpace = ref(false)

const formState = reactive({
  name: '',
  description: '',
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      formState.name = ''
      formState.description = ''
      memberSearch.value = ''
      isPublicToSpace.value = false
    }
  },
)

const handleCancel = () => {
  emit('update:open', false)
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const spaceId = spaceStore.spaceInfo?.id
  if (!spaceId) {
    message.error('当前空间不存在，请切换空间后再试')
    return
  }

  submitting.value = true
  const [error, res] = await to(
    teamApi.createTeam({
      space_id: spaceId,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      icon: 'icon-team',
      visibility: isPublicToSpace.value ? TeamVisibility.SPACE_MEMBER : TeamVisibility.PRIVATE,
    }),
  )
  submitting.value = false

  if (error) {
    message.error(error.message || '新建团队失败')
    return
  }

  message.success('团队创建成功')
  emit('update:open', false)
  emit('success', res.data)
}
</script>

<style scoped>
.create-team-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  padding: 24px;
}
</style>
