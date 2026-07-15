<template>
  <s-full-modal width="580px" :open="open" title="新建文档" :footer="false" :destroy-on-close="true"
    @cancel="handleCancel">
    <!-- 首次加载 -->
    <div v-if="displayLoading && !keyword.trim()" class="flex items-center justify-center min-h-[120px]">
      <a-spin />
    </div>

    <!-- 无知识库：语雀式引导创建默认知识库 -->
    <template v-else-if="showEmptyGuide">
      <p class="mb-4 text-[var(--ant-color-text-secondary)]">你尚未创建知识库</p>
      <div
        class="menu-item-base flex items-center gap-2.5 h-[40px]! px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
        :class="creatingDefault ? 'opacity-60 pointer-events-none' : ''" @click="handleCreateDefault">
        <PlusOutlined class="shrink-0 w-5 h-5 text-[var(--ant-color-text-secondary)]" />
        <span class="flex-1 text-[var(--sd-text-caption)]">创建默认知识库并开始编写</span>
        <LoadingOutlined v-if="creatingDefault" />
      </div>
    </template>

    <!-- 有知识库：选择知识库 -->
    <template v-else>
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
          <Empty0 v-if="!initLoading && list.length === 0" class="py-10!"
            :description="keyword.trim() ? '未找到相关知识库' : '暂无可用知识库'" />
        </a-spin>
        <div v-if="loading && list.length > 0" class="flex justify-center py-2">
          <a-spin size="small" />
        </div>
      </div>
    </template>
  </s-full-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, LockOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
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
import { buildDocumentRouterUrl } from '@sk/utils'
import to from 'await-to-js'
import { message } from 'ant-design-vue'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'ok'): void
}>()

const router = useRouter()
const spaceStore = useSpaceStore()
const { spaceInfo } = storeToRefs(spaceStore)
const keyword = ref('')
const creatingId = ref<string | null>(null)
const creatingDefault = ref(false)

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
/** 无知识库且未搜索：展示默认创建引导（语雀同款） */
const showEmptyGuide = computed(
  () => !initLoading.value && list.value.length === 0 && !keyword.value.trim(),
)

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
      creatingDefault.value = false
      creatingId.value = null
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

const handleCreateDefault = async () => {
  if (creatingDefault.value) return
  const spaceId = spaceInfo.value.id
  if (!spaceId) {
    message.error('空间信息未就绪，请刷新后重试')
    return
  }
  creatingDefault.value = true
  const [err, res] = await to(documentApi.createDefaultDocument(spaceId))
  creatingDefault.value = false
  if (err) return

  const route = res.data
  message.success('文档创建成功')
  emit('ok')
  handleCancel()
  // 同空间内跳转用相对路径（不带 space_domain）
  router.push({
    path: buildDocumentRouterUrl({ ...route, space_domain: undefined }),
    query: { edit: '1' },
  })
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
