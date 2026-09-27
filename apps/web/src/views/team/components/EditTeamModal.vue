<template>
  <a-modal
    :open="open"
    title="编辑团队"
    :footer="null"
    :width="460"
    destroyOnClose
    centered
    @cancel="handleCancel"
  >
    <div class="p-2">
      <a-form layout="vertical" :model="formState" ref="formRef">
        <a-form-item
          label="团队名称"
          name="name"
          :rules="[{ required: true, message: '请输入团队名称', trigger: 'blur' }]"
        >
          <a-input v-model:value="formState.name" placeholder="团队名称" :maxlength="30" />
        </a-form-item>

        <a-form-item label="团队简介" name="description">
          <a-textarea
            v-model:value="formState.description"
            placeholder="团队简介"
            :rows="3"
            :maxlength="200"
          />
        </a-form-item>

        <div class="mb-6 flex items-center justify-between">
          <div>
            <div class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">公开性</div>
            <div class="text-[12px] text-[var(--sd-text-caption)]">公开给空间所有成员</div>
          </div>
          <a-switch v-model:checked="isPublicToSpace" />
        </div>

        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">保存</a-button>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import to from 'await-to-js'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamDetail, type TeamListItem } from '@sk/types'

const props = defineProps<{
  open: boolean
  team: TeamDetail | TeamListItem | null
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  success: []
}>()

const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)
const isPublicToSpace = ref(false)

const formState = reactive({
  name: '',
  description: '',
})

watch(
  () => props.open,
  (val) => {
    if (val && props.team) {
      formState.name = props.team.name
      formState.description = props.team.description || ''
      isPublicToSpace.value = props.team.visibility !== TeamVisibility.PRIVATE
    }
  },
)

const handleCancel = () => {
  emit('update:open', false)
}

const handleSubmit = async () => {
  if (!props.team?.id) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  const [error] = await to(
    teamApi.updateTeam(props.team.id, {
      id: props.team.id,
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      visibility: isPublicToSpace.value ? TeamVisibility.SPACE_MEMBER : TeamVisibility.PRIVATE,
    }),
  )
  submitting.value = false

  if (error) {
    message.error(error.message || '更新团队失败')
    return
  }

  message.success('更新团队成功')
  emit('update:open', false)
  emit('success')
}
</script>
