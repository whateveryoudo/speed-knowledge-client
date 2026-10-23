<template>
  <div class="flex flex-col">
    <div
      @click="onSelect"
      class="group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] cursor-pointer text-[13px] transition-colors relative"
      :class="[
        isSelected
          ? 'bg-[#f0f1f2] text-gray-900 font-medium'
          : 'text-gray-700 hover:bg-[#f5f6f7]'
      ]"
      :style="{ paddingLeft: `${level * 16 + 10}px` }"
    >
      <!-- 左侧图标与部门名称 -->
      <div class="flex items-center min-w-0 flex-1 mr-2 gap-1.5">
        <span
          v-if="hasChildren"
          @click.stop="toggleExpand"
          class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          <CaretDownOutlined v-if="expanded" class="text-[10px]" />
          <CaretRightOutlined v-else class="text-[10px]" />
        </span>
        <span v-else class="w-4 h-4 shrink-0"></span>

        <span class="truncate">{{ node.name }}</span>
      </div>

      <!-- 右侧 Hover 操作按钮 (1:1 语雀交互：+ 号和更多操作) -->
      <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity" @click.stop>
        <!-- 添加子部门 -->
        <a-tooltip title="添加子部门">
          <span
            @click.stop="$emit('addSub', node.id)"
            class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <PlusOutlined class="text-[11px]" />
          </span>
        </a-tooltip>

        <!-- 非根节点显示操作下拉菜单 -->
        <a-dropdown v-if="node.parent_id" trigger="click" placement="bottomRight">
          <span class="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors">
            <EllipsisOutlined class="text-[12px]" />
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item key="edit" @click="$emit('edit', node)">修改部门</a-menu-item>
              <a-menu-item key="delete" danger @click="$emit('delete', node)">删除部门</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 递归子节点 -->
    <div v-if="hasChildren && expanded">
      <DepartmentTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-id="selectedId"
        :level="level + 1"
        @select="$emit('select', $event)"
        @add-sub="$emit('addSub', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import {
  CaretRightOutlined,
  CaretDownOutlined,
  PlusOutlined,
  EllipsisOutlined,
} from '@ant-design/icons-vue'
import type { SpaceDepartmentItem } from '@sk/types'

const props = defineProps<{
  node: SpaceDepartmentItem
  selectedId: string | null
  level: number
}>()

const emit = defineEmits<{
  (e: 'select', node: SpaceDepartmentItem): void
  (e: 'addSub', parentId: string): void
  (e: 'edit', node: SpaceDepartmentItem): void
  (e: 'delete', node: SpaceDepartmentItem): void
}>()

const expanded = ref(true)

const isSelected = computed(() => props.selectedId === props.node.id)
const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const onSelect = () => {
  emit('select', props.node)
}
</script>
