<template>
  <a-modal
    :open="visible"
    title="添加空间成员"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    destroy-on-close
  >
    <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical" class="pt-2">
      <a-form-item label="用户ID" name="user_id" extra="输入系统已注册的用户ID">
        <a-input-number
          v-model:value="formData.user_id"
          class="w-full"
          placeholder="请输入用户ID，如 1, 2..."
          :min="1"
        />
      </a-form-item>

      <a-form-item label="成员角色" name="role">
        <a-select v-model:value="formData.role">
          <a-select-option :value="SpaceMemberRole.MEMBER">成员</a-select-option>
          <a-select-option :value="SpaceMemberRole.ADMIN">管理员</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="归属部门" name="department_ids">
        <a-tree-select
          v-model:value="formData.department_ids"
          :tree-data="departmentTree"
          placeholder="选择归属部门（留空则默认加入空间根部门）"
          multiple
          tree-checkable
          tree-default-expand-all
          :field-names="{ label: 'name', value: 'id', children: 'children' }"
          class="w-full"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { space as spaceApi } from '@sk/api'
import { SpaceMemberRole, type SpaceDepartmentItem } from '@sk/types'

defineProps<{
  visible: boolean
  departmentTree: SpaceDepartmentItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref<{
  user_id: number | null
  role: SpaceMemberRole
  department_ids: string[]
}>({
  user_id: null,
  role: SpaceMemberRole.MEMBER,
  department_ids: [],
})

const rules = {
  user_id: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    if (!formData.value.user_id) return
    loading.value = true
    await spaceApi.addSpaceMember({
      user_id: formData.value.user_id,
      department_ids: formData.value.department_ids,
      role: formData.value.role,
    })
    message.success('成员添加成功')
    emit('update:visible', false)
    emit('success')
  } catch (error: any) {
    if (error?.response?.data?.detail) {
      message.error(error.response.data.detail)
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}
</script>
