<template>
  <a-modal
    :open="visible"
    title="调整所属部门"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    destroy-on-close
  >
    <div class="py-2">
      <div class="text-[13px] text-gray-500 mb-3">
        正在为成员 <span class="font-medium text-gray-800">{{ memberName }}</span> 调整归属部门：
      </div>
      <a-form layout="vertical">
        <a-form-item label="归属部门" required>
          <a-tree-select
            v-model:value="selectedDeptIds"
            :tree-data="departmentTree"
            placeholder="请选择部门（可多选）"
            multiple
            tree-checkable
            tree-default-expand-all
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            class="w-full"
            :show-checked-strategy="TreeSelect.SHOW_ALL"
          />
        </a-form-item>
      </a-form>
      <div class="text-[12px] text-gray-400 mt-2">
        提示：若清空全部部门，系统将自动将该成员归入主根部门。
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { message, TreeSelect } from 'ant-design-vue'
import { space as spaceApi } from '@sk/api'
import type { SpaceDepartmentItem, SpaceMemberListItem } from '@sk/types'

const props = defineProps<{
  visible: boolean
  member?: SpaceMemberListItem | null
  departmentTree: SpaceDepartmentItem[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const selectedDeptIds = ref<string[]>([])

const memberName = computed(() => {
  return props.member?.user?.nickname || props.member?.user?.username || '该成员'
})

watch(
  () => props.visible,
  (val) => {
    if (val && props.member) {
      // 预选当前成员匹配的部门
      const currentNames = props.member.department_names || []
      const matchedIds: string[] = []
      const findMatched = (nodes: SpaceDepartmentItem[]) => {
        for (const n of nodes) {
          if (currentNames.includes(n.name)) {
            matchedIds.push(n.id)
          }
          if (n.children && n.children.length) {
            findMatched(n.children)
          }
        }
      }
      findMatched(props.departmentTree)
      selectedDeptIds.value = matchedIds
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!props.member?.id) return
  try {
    loading.value = true
    await spaceApi.adjustMemberDepartments(props.member.id, selectedDeptIds.value)
    message.success('部门调整成功')
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
