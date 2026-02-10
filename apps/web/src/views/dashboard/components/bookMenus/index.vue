<template>
  <div class="book-menus h-full">
    <!-- 展开态：一层菜单 + 可折叠的 MenuList -->
    <div class="px-2 h-full" v-if="expanded">
      <div
        class="book-header flex items-center rounded-[6px] h-[36px] pl-1 pr-3 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
        :class="{ 'pl-3': knowledgeList.length === 0, 'bg-[var(--sd-bg-primary-hover)]': route.path === '/dashboard/knowledge' }"
        @click="router.push('/dashboard/knowledge')">
        <a-button v-if="knowledgeList.length > 0" type="text"
          class="shadow-btn-wrapper mr-2 text-[var(--sd-grey-7)] hover:text-[var(--sd-text-grey-900)]">
          <span class="transition-transform duration-200" @click="toggleInner" :class="{ 'rotate-90': innerExpanded }">
            <CaretRightOutlined />
          </span>
        </a-button>
        <span class="text-[var(--sd-text-grey-900)] font-medium">知识库</span>
        <span class="ml-auto">
          <RightOutlined class="text-[12px] text-[var(--sd-text-grey-900)] opacity-60" />
        </span>
      </div>
      <Collapse :when="innerExpanded" class="book-list">
        <SkeletonList :loading="loading">
          <MenuList v-if="knowledgeList.length > 0" :books="knowledgeList" :show-more="true"
            @drag-end="handleDragEnd" />
          <Empty0 hasTop v-else description="暂无知识库" />
        </SkeletonList>
      </Collapse>

    </div>

    <!-- 收起态：只显示图标，点击弹出菜单列表（保留第一层标题，不再折叠） -->
    <template v-else>
      <a-popover placement="rightTop">
        <template #content>
          <div class="w-[240px]">
            <div
              class="book-header flex items-center h-[32px] px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200 rounded-[6px]">
              <span class="text-[var(--sd-text-grey-900)] font-medium">知识库</span>
              <span class="ml-auto">
                <RightOutlined class="text-[12px] text-[var(--sd-text-grey-900)] opacity-60" />
              </span>
            </div>
            <div class="book-list">
              <MenuList :books="knowledgeList" :show-more="false" @on-delete="handleDelete"
                @on-drag-end="handleDragEnd" />
            </div>
          </div>
        </template>
        <!-- <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]!">
          <component :is="activeBookKey ? ReadFilled : ReadOutlined" class="text-18px" />
        </a-button> -->
      </a-popover>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  CaretRightOutlined,
  RightOutlined,
  MoreOutlined,
  ReadOutlined,
  ReadFilled,
} from '@ant-design/icons-vue'
import { Collapse } from 'vue-collapsed'
import MenuList from './MenuList.vue'
import { useKnowledgeList } from '../../composables/useKnowledgeListContext'
const router = useRouter()
const route = useRoute()
const props = withDefaults(
  defineProps<{
    expanded?: boolean
  }>(),
  {
    expanded: true,
  }
)
const { knowledgeList, initKnowledgeList, handleDelete, handleDragEnd } = useKnowledgeList()
const emit = defineEmits<{
  'update:expanded': [expanded: boolean]
}>()
const loading = ref(false)
// 外部控制的展开/收起
const expanded = ref<boolean>(props.expanded)
watch(() => props.expanded, (v) => {
  expanded.value = !!v
})

// 内部列表折叠（仅在展开态下生效）
const innerExpanded = ref(true)
// 切换内部折叠
const toggleInner = () => {
  innerExpanded.value = !innerExpanded.value
}
// 初始化知识库列表
initKnowledgeList();

</script>

<style lang="less" scoped>
.book-menus {
  .book-header {
    user-select: none;
  }

  .expand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 12px;
    color: var(--sd-text-grey-900);
    opacity: 0.6;
  }

  .book-list {
    max-height: calc(100% - 40px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .book-item {
    user-select: none;
    position: relative;

    // 整体也可以拖拽（除了句柄区域）
    &.draggable-item {
      cursor: move;
    }
  }

  // 拖拽时的样式
  :deep(.ghost-item) {
    opacity: 0.5;
    background-color: var(--sd-bg-primary-hover);
  }

  :deep(.chosen-item) {
    cursor: move;
  }

  :deep(.drag-item) {
    opacity: 0.8;
  }
}
</style>
