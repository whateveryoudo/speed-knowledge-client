<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '修改部门' : '新建部门'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    destroy-on-close
  >
    <a-form :model="formData" :rules="rules" ref="formRef" layout="vertical" class="pt-2">
      <a-form-item label="部门名称" name="name">
        <a-input
          v-model:value="formData.name"
          placeholder="请输入部门名称"
          :maxlength="100"
          show-count
        />
      </a-form-item>

      <a-form-item label="上级部门" name="parent_id">
        <a-tree-select
          v-model:value="formData.parent_id"
          :tree-data="treeSelectData"
          placeholder="选择上级部门（留空为顶级部门）"
          allow-clear
          tree-default-expand-all
          :field-names="{ label: 'name', value: 'id', children: 'children' }"
          :disabled="isRootDepartment"
        />
        <div v-if="isRootDepartment" class="text-[12px] text-gray-400 mt-1">
          空间主根部门不可修改上级部门
        </div>
      </a-form-item>

      <a-form-item label="显示排序" name="sort_order">
        <a-input-number
          v-model:value="formData.sort_order"
          :min="0"
          :max="9999"
          class="w-full"
          placeholder="数字越小越靠前"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { space as spaceApi } from '@sk/api'
import type { SpaceDepartmentItem } from '@sk/types'

const props = defineProps<{
  visible: boolean
  editData?: SpaceDepartmentItem | null
  parentDeptId?: string | null
  departmentTree: SpaceDepartmentItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!props.editData?.id)
const isRootDepartment = computed(() => isEdit.value && !props.editData?.parent_id)

const formData = ref<{
  name: string
  parent_id: string | null
  sort_order: number
}>({
  name: '',
  parent_id: null,
  sort_order: 0,
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

// 过滤掉自己和自己的子孙节点（防止成环）
const filterTreeForSelect = (list: SpaceDepartmentItem[], excludeId?: string): any[] => {
  if (!list) return []
  return list
    .filter((node) => node.id !== excludeId)
    .map((node) => ({
      ...node,
      children: node.children ? filterTreeForSelect(node.children, excludeId) : [],
    }))
}

const treeSelectData = computed(() => {
  return filterTreeForSelect(props.departmentTree, props.editData?.id)
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.editData) {
        formData.value = {
          name: props.editData.name,
          parent_id: props.editData.parent_id || null,
          sort_order: props.editData.sort_order || 0,
        }
      } else {
        formData.value = {
          name: '',
          parent_id: props.parentDeptId || null,
          sort_order: 0,
        }
      }
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    if (isEdit.value && props.editData?.id) {
      await spaceApi.updateDepartment(props.editData.id, {
        name: formData.value.name,
        parent_id: formData.value.parent_id,
        sort_order: formData.value.sort_order,
      })
      message.success('部门修改成功')
    } else {
      await spaceApi.createDepartment({
        name: formData.value.name,
        parent_id: formData.value.parent_id,
        sort_order: formData.value.sort_order,
      })
      message.success('部门创建成功')
    }
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
