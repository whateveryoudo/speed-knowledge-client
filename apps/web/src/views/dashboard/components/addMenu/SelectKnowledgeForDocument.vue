<template>
  <s-full-modal width="580px" :open="open" title="新建文档" :footer="false" :destroy-on-close="true" @cancel="handleCancel">
    <p class="mb-4 text-[var(--ant-color-text-secondary)]">选择一个知识库</p>
    <a-input v-model:value="keyword" allow-clear placeholder="请输入知识库名称进行搜索">
      <template #prefix>
        <SearchOutlined class="text-[var(--ant-color-text-tertiary)]" />
      </template>
    </a-input>

    <div
      :class="['mt-4 max-h-[360px] min-h-[200px] overflow-y-auto', displayLoading ? 'flex items-center justify-center' : '']"
      @scroll="handleScroll">
      <a-spin :spinning="displayLoading">
        <div v-for="item in list" :key="item.id"
          class="menu-item-base text-[var(--sd-text-caption)] flex items-center gap-2.5 h-[40px]! px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
          :class="creatingId === item.id ? 'opacity-60 pointer-events-none' : ''" @click="handleSelect(item)">
          <IconFont type="icon-book-0" svg-sprite class="shrink-0 w-5 h-5 " />
          <span class="flex-1 truncate">
            {{ item.team.slug }} / {{ item.name }}
          </span>
          <LoadingOutlined v-if="creatingId === item.id" />
          <LockOutlined v-if="!item.is_public" class="shrink-0 text-[12px]" />
        </div>
        <Empty0 v-if="!initLoading && list.length === 0" class="py-10!" description="暂无可用知识库" />
      </a-spin>
      <div v-if="loading && list.length > 0" class="flex justify-center py-2">
        <a-spin size="small" />
      </div>
    </div>
  </s-full-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { IconFont } from 'speed-components-ui/components'
import { useLoadMore } from 'speed-components-ui/hooks'
import { useDebounceFn } from '@vueuse/core'
import { knowledge as knowledgeApi, document as documentApi } from '@sk/api'
import {
  DocumentAbility,
  DocumentType,
  ListSortOrder,
  type KnowledgeItem,
} from '@sk/types'
import to from 'await-to-js'
import { message } from 'ant-design-vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const keyword = ref('')
const creatingId = ref<string | null>(null)

const loadMoreOptions = computed(() => ({
  extraParams: {
    keyword: keyword.value.trim() || undefined,
    abilities: [DocumentAbility.DOC_CTEATE],
    sorts: [{ field: 'updated_at', order: ListSortOrder.DESC }],
    page_size: 20,
  },
}))

const { list, loading, initLoading, noMore, initLoad, onLoadMore } = useLoadMore(
  knowledgeApi.getKnowledgeMineList,
  loadMoreOptions,
)
const displayLoading = computed(() => initLoading.value && list.value.length === 0)
const handleCancel = () => {
  emit('update:open', false)
}

const reloadList = () => {
  initLoad(true)
}

const debouncedSearch = useDebounceFn(() => {
  reloadList()
}, 300)

watch(keyword, () => {
  debouncedSearch()
})

watch(
  () => props.open,
  (visible) => {
    if (visible) {
      keyword.value = ''
      reloadList()
    }
  },
)

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target || loading.value || noMore.value) return
  const threshold = 48
  if (target.scrollHeight - target.scrollTop - target.clientHeight <= threshold) {
    onLoadMore()
  }
}

const handleSelect = async (item: KnowledgeItem) => {
  if (creatingId.value) return
  creatingId.value = item.id
  const [err, res] = await to(
    documentApi.addDocument({
      knowledge_id: item.id,
      type: DocumentType.WORD,
      name: '无标题文档',
    }),
  )
  creatingId.value = null
  if (err) return

  message.success('文档创建成功')
  handleCancel()
  router.push({
    path: `/${item.team.slug}/knowledge/${item.slug}/document/${res.data.document_slug}`,
    query: { edit: '1' },
  })
}
</script>
