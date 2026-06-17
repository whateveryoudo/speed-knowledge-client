<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LockOutlined, MoreOutlined, PushpinFilled, PushpinOutlined } from '@ant-design/icons-vue'
import type { TableColumnType } from 'ant-design-vue'
import { useTable } from 'speed-components-ui/hooks'
import { knowledge as knowledgeApi } from '@sk/api'
import {
  KnowledgeFromWay,
  ListSortOrder,
  type KnowledgeItem,
  type KnowledgeListQuery,
} from '@sk/types'
import { transformDatatimeToRecentText } from '@sk/utils'
import { useKnowledgeList } from '../../composables/useKnowledgeListContext'
import { useKnowledgeBookMenu } from '../../composables/useKnowledgeBookMenu'
import DeleteKnowledge from '../../components/deleteKnowledge/index.vue'

const props = defineProps<{
  keyword: string
}>()

const router = useRouter()
const tableOptions = computed(() => ({
  extraParams: {
    scope: KnowledgeFromWay.COLLABORATION,
    keyword: props.keyword.trim() || undefined,
    sorts: [{ field: 'updated_at', order: ListSortOrder.DESC }],
  } satisfies Partial<KnowledgeListQuery>,
}))
const { dataSource, loading, getList, pagination } = useTable(
  knowledgeApi.getKnowledgeListPage,
  tableOptions,
)
const { isPinned } = useKnowledgeList()
const {
  buildMenuItems,
  handleMenuClick,
  handleTogglePin,
  deleteKnowledgeVisible,
  renameInputRef,
  isRenaming,
  handleRenameBlur,
  currentBook,
} = useKnowledgeBookMenu()

const formatUpdateTime = (record: KnowledgeItem) => {
  const time = record.content_updated_at || record.updated_at
  return time ? transformDatatimeToRecentText(time) : '-'
}

const goKnowledge = (book: KnowledgeItem) => {
  if (isRenaming(book.id)) return
  router.push(`/${book.team.slug}/knowledge/${book.slug}`)
}

const onMenuClick = (e: { key: string }, book: KnowledgeItem) => {
  handleMenuClick(e.key, book)
}

const onTogglePin = (book: KnowledgeItem) => {
  handleTogglePin(book, isPinned(book.id))
}

const onRenameBlur = async (value: string, book: KnowledgeItem) => {
  await handleRenameBlur(value, book)
  const row = dataSource.value.find((item) => item.id === book.id)
  if (row) {
    row.name = value.trim() || row.name
  }
}

const onDeleteSuccess = () => {
  if (!currentBook.value) return
  const slug = currentBook.value.slug
  const idx = dataSource.value.findIndex((item) => item.slug === slug)
  if (idx !== -1) {
    dataSource.value.splice(idx, 1)
  }
}

const columns: TableColumnType<KnowledgeItem>[] = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: '归属',
    dataIndex: 'team',
    ellipsis: true,
    customRender: ({ record }) => (record as KnowledgeItem).team?.name || '-',
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    width: 160,
    customRender: ({ record }) => formatUpdateTime(record as KnowledgeItem),
  },
  {
    title: '',
    key: 'action',
    width: 120,
    align: 'right',
  },
]

watch(
  () => props.keyword,
  () => {
    getList()
  },
)

onMounted(() => {
  getList()
})

defineExpose({
  refresh: getList,
})
</script>

<template>
  <a-table
    row-key="id"
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :scroll="{ x: 720 }"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'name'">
        <div
          class="flex min-w-0 cursor-pointer items-center gap-2"
          @click="goKnowledge(record as KnowledgeItem)"
        >
          <s-icon-font
            :type="(record as KnowledgeItem).icon"
            svg-sprite
            class="shrink-0"
            style="width: 22px; height: 22px"
          />
          <a-input
            v-if="isRenaming((record as KnowledgeItem).id)"
            ref="renameInputRef"
            size="small"
            class="min-w-0 flex-1"
            :value="(record as KnowledgeItem).name"
            @click.stop
            @blur="(e: FocusEvent) => onRenameBlur((e.target as HTMLInputElement).value, record as KnowledgeItem)"
          />
          <span v-else class="truncate text-[var(--sd-text-grey-900)]">
            {{ (record as KnowledgeItem).name }}
          </span>
          <LockOutlined
            v-if="!(record as KnowledgeItem).is_public"
            class="shrink-0 text-[12px] text-[var(--sd-grey-7)]"
          />
        </div>
      </template>
      <template v-else-if="column.key === 'action'">
        <div class="flex items-center justify-end gap-4">
          <a-tooltip :title="isPinned((record as KnowledgeItem).id) ? '移出常用' : '设为常用'">
            <span
              class="inline-flex cursor-pointer text-[14px] text-[var(--sd-grey-8)] hover:text-[var(--sd-link-color)]"
              @click.stop="onTogglePin(record as KnowledgeItem)"
            >
              <PushpinFilled v-if="isPinned((record as KnowledgeItem).id)" />
              <PushpinOutlined v-else />
            </span>
          </a-tooltip>
          <a-dropdown trigger="click">
            <a-button type="text" class="shadow-btn-wrapper icon" @click.stop>
              <template #icon>
                <MoreOutlined />
              </template>
            </a-button>
            <template #overlay>
              <a-menu
                @click="(e: { key: string }) => onMenuClick(e, record as KnowledgeItem)"
                :items="buildMenuItems(record as KnowledgeItem)"
              />
            </template>
          </a-dropdown>
        </div>
      </template>
    </template>
    <template #emptyText>
      <Empty0 has-top description="暂无协作知识库" />
    </template>
  </a-table>

  <DeleteKnowledge
    v-model:visible="deleteKnowledgeVisible"
    :slug="currentBook?.slug ?? ''"
    :name="currentBook?.name ?? ''"
    @success="onDeleteSuccess"
  />
</template>
