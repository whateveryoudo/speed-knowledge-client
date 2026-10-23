<template>
  <div class="w-[240px] h-full shrink-0 flex flex-col px-3 py-4 border-0 border-r border-solid border-[var(--sd-border-primary)] select-none bg-white">
    <!-- 部门/成员搜索框 -->
    <div class="mb-3 px-0.5">
      <a-input
        v-model:value="searchKeyword"
        placeholder="搜索成员或部门"
        allow-clear
        class="rounded-[6px]"
      >
        <template #prefix>
          <SearchOutlined class="text-gray-400 text-[13px]" />
        </template>
      </a-input>
    </div>

    <!-- 树结构容器 (使用 Ant Design Vue 的 a-tree) -->
    <div class="flex-1 overflow-y-auto custom-thin-scrollbar pr-1">
      <a-tree
        v-if="filteredTree.length > 0"
        :tree-data="filteredTree"
        :field-names="{ key: 'id', title: 'name', children: 'children' }"
        :selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        block-node
        class="department-antd-tree"
        @select="onTreeSelect"
      >
        <template #title="{ dataRef: node }">
          <div class="group flex items-center justify-between w-full pr-1 py-0.5">
            <span class="truncate flex-1 text-[13px] text-[var(--sd-text-primary)]" :title="node.name">
              {{ node.name }}
            </span>
            <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity" @click.stop>
              <!-- 添加子部门 -->
              <a-tooltip title="添加子部门">
                <span
                  @click.stop="handleAddSub(node.id)"
                  class="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-caption)] hover:text-[var(--sd-text-primary)] cursor-pointer"
                >
                  <PlusOutlined class="text-[11px]" />
                </span>
              </a-tooltip>

              <!-- 非根节点显示更多操作下拉菜单 -->
              <a-dropdown v-if="node.parent_id" trigger="click" placement="bottomRight">
                <span
                  @click.stop
                  class="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-caption)] hover:text-[var(--sd-text-primary)] cursor-pointer"
                >
                  <MoreOutlined class="text-[12px]" />
                </span>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="edit" @click="handleEdit(node)">
                      编辑部门
                    </a-menu-item>
                    <a-menu-item key="delete" danger @click="handleDelete(node)">
                      删除部门
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </div>
        </template>
      </a-tree>
      <div v-else class="text-center text-gray-400 py-8 text-[13px]">
        未找到相关部门
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { SearchOutlined, PlusOutlined, MoreOutlined } from '@ant-design/icons-vue'
import type { SpaceDepartmentItem } from '@sk/types'

const props = defineProps<{
  treeData: SpaceDepartmentItem[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', node: SpaceDepartmentItem): void
  (e: 'addSub', parentId: string): void
  (e: 'edit', node: SpaceDepartmentItem): void
  (e: 'delete', node: SpaceDepartmentItem): void
}>()

const searchKeyword = ref('')
const expandedKeys = ref<string[]>([])

// 选中的节点 Keys
const selectedKeys = computed(() => (props.selectedId ? [props.selectedId] : []))

// 递归收集所有节点 key，初始时默认全部展开
const collectAllKeys = (nodes: SpaceDepartmentItem[]): string[] => {
  const keys: string[] = []
  for (const n of nodes) {
    keys.push(n.id)
    if (n.children && n.children.length > 0) {
      keys.push(...collectAllKeys(n.children))
    }
  }
  return keys
}

// 自动展开已加载的树节点
watch(
  () => props.treeData,
  (nodes) => {
    if (nodes && nodes.length > 0) {
      const allKeys = collectAllKeys(nodes)
      expandedKeys.value = Array.from(new Set([...expandedKeys.value, ...allKeys]))
    }
  },
  { immediate: true },
)

// 关键词过滤
const filterNodes = (nodes: SpaceDepartmentItem[], keyword: string): SpaceDepartmentItem[] => {
  if (!keyword.trim()) return nodes
  const lower = keyword.toLowerCase()
  const result: SpaceDepartmentItem[] = []

  for (const node of nodes) {
    const matchSelf = node.name.toLowerCase().includes(lower)
    const matchChildren = node.children ? filterNodes(node.children, keyword) : []

    if (matchSelf || matchChildren.length > 0) {
      result.push({
        ...node,
        children: matchChildren.length > 0 ? matchChildren : node.children,
      })
    }
  }
  return result
}

const filteredTree = computed(() => {
  return filterNodes(props.treeData, searchKeyword.value)
})

// 树节点选中事件
const onTreeSelect = (_selectedKeys: any[], { selected, node }: any) => {
  if (selected && node?.dataRef) {
    emit('select', node.dataRef)
  }
}

const handleAddSub = (parentId: string) => {
  emit('addSub', parentId)
}

const handleEdit = (node: SpaceDepartmentItem) => {
  emit('edit', node)
}

const handleDelete = (node: SpaceDepartmentItem) => {
  emit('delete', node)
}
</script>

<style scoped>
:deep(.department-antd-tree) {
  background: transparent;
}
:deep(.department-antd-tree .ant-tree-node-content-wrapper) {
  border-radius: 6px;
  transition: all 0.2s;
  padding: 0 4px;
}
:deep(.department-antd-tree .ant-tree-node-content-wrapper:hover) {
  background-color: var(--sd-bg-primary-hover, rgba(0, 0, 0, 0.04));
}
:deep(.department-antd-tree .ant-tree-node-selected) {
  background-color: var(--sd-bg-primary-hover, #e6f4ff) !important;
  color: var(--ant-color-primary, #1677ff) !important;
  font-weight: 500;
}
:deep(.department-antd-tree .ant-tree-switcher) {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
