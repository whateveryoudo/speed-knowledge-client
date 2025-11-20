<template>
  <div class="book-menus">
    <!-- 展开态：一层菜单 + 可折叠的 MenuList -->
    <div class="px-2" v-if="expanded">
      <div
        class="book-header flex items-center rounded-[6px] h-[36px] pl-1 pr-3 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
        :class="{ 'pl-3': bookList.length === 0 }" @click="toggleInner">
        <a-button v-if="bookList.length > 0" type="text"
          class="shadow-btn-wrapper mr-2 text-[var(--sd-grey-7)] hover:text-[var(--sd-text-grey-900)]">
          <span class="transition-transform duration-200" :class="{ 'rotate-90': innerExpanded }">
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
          <MenuList v-if="bookList.length > 0" :books="bookList" :active-book-key="activeBookKey"
            :drag-handle-mode="dragHandleMode" :show-more="true" @update:books="onBooksUpdate"
            @update:activeBookKey="onActiveKeyUpdate" @book-click="handleBookClick" @drag-start="onDragStart"
            @drag-end="onDragEnd" />
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
              <MenuList :books="bookList" :active-book-key="activeBookKey" :drag-handle-mode="dragHandleMode"
                :show-more="false" @update:books="onBooksUpdate" @update:activeBookKey="onActiveKeyUpdate"
                @book-click="handleBookClick" @drag-start="onDragStart" @drag-end="onDragEnd" />
            </div>
          </div>
        </template>
        <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]!">
          <component :is="activeBookKey ? ReadFilled : ReadOutlined" class="text-18px" />
        </a-button>
      </a-popover>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  CaretRightOutlined,
  RightOutlined,
  MoreOutlined,
  ReadOutlined,
  ReadFilled,
} from '@ant-design/icons-vue'
import { Collapse } from 'vue-collapsed'
import MenuList from './MenuList.vue'
import { knowledge as knowledgeApi} from '@sk/api'
import { type KnowledgeItem } from '@sk/types'
import to from 'await-to-js'

const props = withDefaults(
  defineProps<{
    books?: KnowledgeItem[]
    activeBookKey?: string
    expanded?: boolean
  }>(),
  {
    books: () => [],
    activeBookKey: '',
    expanded: true,
  }
)

const emit = defineEmits<{
  'update:books': [books: KnowledgeItem[]]
  'update:activeBookKey': [key: string]
  'book-click': [book: KnowledgeItem]
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
// 知识库列表（支持拖拽）
const bookList = ref<KnowledgeItem[]>([])

// 当前激活的知识库
const activeBookKey = ref(props.activeBookKey || '')

// 拖拽模式：'handle' 仅句柄拖拽，'full' 整体拖拽
const dragHandleMode = ref<'handle' | 'full'>('handle')
const isDragging = ref(false)

// 切换内部折叠
const toggleInner = () => {
  innerExpanded.value = !innerExpanded.value
}

// 拖拽开始
const onDragStart = () => {
  isDragging.value = true
}

// 拖拽结束
const onDragEnd = () => {
  isDragging.value = false
}

// 切换拖拽模式（可以通过双击切换）
const toggleDragMode = () => {
  dragHandleMode.value = dragHandleMode.value === 'handle' ? 'full' : 'handle'
}

// 点击知识库
const handleBookClick = (book: BookItem) => {
  activeBookKey.value = book.id
  emit('update:activeBookKey', book.id)
  emit('book-click', book)
}

const onBooksUpdate = (newBooks: BookItem[]) => {
  bookList.value = [...newBooks]
  emit('update:books', bookList.value)
}

const onActiveKeyUpdate = (key: string) => {
  activeBookKey.value = key
  emit('update:activeBookKey', key)
}

// 监听 bookList 变化，同步到父组件
watch(bookList, (newBooks) => {
  emit('update:books', newBooks)
}, { deep: true })

// 监听 props.books 变化，同步到内部
watch(() => props.books, (newBooks) => {
  if (newBooks.length > 0) {
    bookList.value = [...newBooks]
  }
}, { deep: true })

const initKnowledgeList = async () => {
  loading.value = true
  const [error, res] = await to(knowledgeApi.getKnowledgeList())
  if (!error) {
    bookList.value = res.data
  }
  loading.value = false
}

initKnowledgeList()


// 监听 props.activeBookKey 变化
watch(() => props.activeBookKey, (newKey) => {
  activeBookKey.value = newKey || ''
})
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
    max-height: calc(100vh - 300px);
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
