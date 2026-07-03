import { computed, ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useLoadMore } from 'speed-components-ui/hooks'
import to from 'await-to-js'
import { knowledge as knowledgeApi, search as searchApi } from '@sk/api'
import {
  ListSortOrder,
  SearchContextType,
  SearchVisibilityType,
  type DocumentNodeTreeItem,
  type KnowledgeItem,
  type SearchDocumentItem,
  type SearchKnowledgeItem,
} from '@sk/types'

export type SearchModalContext = 'global' | 'knowledge'
export type SearchVisibilityTab = 'related' | 'public'

export interface FlatDocumentItem {
  id: string
  name: string
  slug: string
  type: string
  knowledge_id?: string
  knowledge_name?: string
  knowledge_slug?: string
  team_slug?: string
  updated_at?: string
}

export interface UseSearchOptions {
  context: SearchModalContext
  open: Ref<boolean>
  knowledgeId?: Ref<string>
  knowledgeName?: Ref<string>
  teamSlug?: Ref<string>
  knowledgeSlug?: Ref<string>
  documentTree?: Ref<DocumentNodeTreeItem[]>
}

function flattenDocumentTree(nodes: DocumentNodeTreeItem[]): FlatDocumentItem[] {
  const result: FlatDocumentItem[] = []
  const walk = (items: DocumentNodeTreeItem[]) => {
    for (const node of items) {
      if (node.document_id && node.document_slug) {
        result.push({
          id: node.document_id,
          name: node.title || '无标题文档',
          slug: node.document_slug,
          type: node.type,
          knowledge_id: node.knowledge_id,
          updated_at: node.updated_at,
        })
      }
      if (node.children?.length) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return result
}

function filterByKeyword<T extends { name: string }>(items: T[], keyword: string) {
  const q = keyword.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => item.name.toLowerCase().includes(q))
}

export function useSearch(options: UseSearchOptions) {
  const keyword = ref('')
  const visibility = ref<SearchVisibilityTab>('related')
  const searchLoading = ref(false)
  const searchKnowledgeItems = ref<SearchKnowledgeItem[]>([])
  const searchDocumentItems = ref<SearchDocumentItem[]>([])

  const trimmedKeyword = computed(() => keyword.value.trim())
  const isKeywordMode = computed(() => trimmedKeyword.value.length > 0)
  const isPublicPlaceholder = computed(
    () => options.context === 'global' && visibility.value === 'public',
  )

  const knowledgeLoadOptions = computed(() => ({
    extraParams: {
      sorts: [{ field: 'updated_at', order: ListSortOrder.DESC }],
      page_size: 20,
    },
  }))

  const {
    list: knowledgeList,
    loading: knowledgeLoading,
    initLoading: knowledgeInitLoading,
    noMore: knowledgeNoMore,
    initLoad: initKnowledgeLoad,
    onLoadMore: onKnowledgeLoadMore,
  } = useLoadMore(knowledgeApi.getKnowledgeMineList, knowledgeLoadOptions)

  /** 全局搜索默认知识库列表：同一次弹窗会话内只请求一次，清空关键词复用缓存 */
  const knowledgeBrowseLoaded = ref(false)

  const knowledgeBrowseItems = computed(() =>
    knowledgeList.value.map((item: KnowledgeItem) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      team_slug: item.team?.slug,
      is_public: item.is_public,
    })),
  )

  const knowledgeInKnowledgeBrowseItems = computed<FlatDocumentItem[]>(() => {
    const tree = options.documentTree?.value ?? []
    const flat = flattenDocumentTree(tree).map((item) => ({
      ...item,
      knowledge_id: options.knowledgeId?.value,
      knowledge_name: options.knowledgeName?.value,
      knowledge_slug: options.knowledgeSlug?.value,
      team_slug: options.teamSlug?.value,
    }))
    return filterByKeyword(flat, trimmedKeyword.value)
  })

  const displayKnowledgeItems = computed(() => {
    if (options.context === 'knowledge') return []
    if (isPublicPlaceholder.value) return []
    if (isKeywordMode.value) return searchKnowledgeItems.value
    return knowledgeBrowseItems.value
  })

  const displayDocumentItems = computed<Array<SearchDocumentItem | FlatDocumentItem>>(() => {
    if (isPublicPlaceholder.value) return []
    if (options.context === 'knowledge') {
      if (isKeywordMode.value) return searchDocumentItems.value
      return knowledgeInKnowledgeBrowseItems.value
    }
    if (!isKeywordMode.value) return []
    return searchDocumentItems.value
  })

  const displayLoading = computed(() => {
    if (isPublicPlaceholder.value) return false
    if (isKeywordMode.value) return searchLoading.value
    if (options.context === 'knowledge') return false
    return knowledgeInitLoading.value && knowledgeList.value.length === 0
  })

  const listLoading = computed(() => {
    if (isKeywordMode.value) return searchLoading.value
    if (options.context === 'global') {
      return knowledgeLoading.value
    }
    return false
  })

  const ensureKnowledgeBrowse = () => {
    if (options.context !== 'global' || isPublicPlaceholder.value) return
    if (knowledgeBrowseLoaded.value || knowledgeInitLoading.value) return
    knowledgeBrowseLoaded.value = true
    void initKnowledgeLoad()
  }

  const runKeywordSearch = async () => {
    if (isPublicPlaceholder.value) return
    const q = trimmedKeyword.value
    if (!q) {
      searchKnowledgeItems.value = []
      searchDocumentItems.value = []
      return
    }

    searchLoading.value = true
    const payload = {
      context:
        options.context === 'global'
          ? SearchContextType.GLOBAL
          : SearchContextType.KNOWLEDGE,
      visibility: SearchVisibilityType.RELATED,
      keyword: q,
      ...(options.context === 'knowledge' && options.knowledgeId?.value
        ? { knowledge_id: options.knowledgeId.value }
        : {}),
    }

    const [err, res] = await to(searchApi.search(payload))
    searchLoading.value = false
    if (err || !res?.data) {
      searchKnowledgeItems.value = []
      searchDocumentItems.value = []
      return
    }

    const sections = res.data.sections ?? []
    searchKnowledgeItems.value = sections
      .filter((section) => section.type === 'knowledge')
      .flatMap((section) => section.items as SearchKnowledgeItem[])
    searchDocumentItems.value = sections
      .filter((section) => section.type === 'document')
      .flatMap((section) => section.items as SearchDocumentItem[])
  }

  const debouncedKeywordSearch = useDebounceFn(() => {
    if (!isKeywordMode.value) {
      searchKnowledgeItems.value = []
      searchDocumentItems.value = []
      visibility.value = 'related'
      return
    } 
    if (visibility.value === 'related') {
      runKeywordSearch()
    }
  }, 300)

  watch(keyword, () => {
    debouncedKeywordSearch()
  })

  watch(visibility, (value) => {
    if (value === 'public') {
      searchKnowledgeItems.value = []
      searchDocumentItems.value = []
      return
    }
    if (isKeywordMode.value) {
      runKeywordSearch()
    }
  })

  watch(
    () => options.open.value,
    (visible) => {
      if (!visible) return
      keyword.value = ''
      visibility.value = 'related'
      searchKnowledgeItems.value = []
      searchDocumentItems.value = []
      if (options.context === 'global') {
        ensureKnowledgeBrowse()
      }
    },
  )

  const handleScroll = (event: Event) => {
    if (isKeywordMode.value || isPublicPlaceholder.value || options.context === 'knowledge') {
      return
    }
    const target = event.target as HTMLElement
    if (!target) return
    const threshold = 48
    const nearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight <= threshold
    if (!nearBottom) return
    if (!knowledgeNoMore.value && !knowledgeLoading.value) {
      onKnowledgeLoadMore()
    }
  }

  const switchVisibility = (value: SearchVisibilityTab) => {
    visibility.value = value
  }

  return {
    keyword,
    visibility,
    isKeywordMode,
    isPublicPlaceholder,
    displayKnowledgeItems,
    displayDocumentItems,
    displayLoading,
    listLoading,
    handleScroll,
    switchVisibility,
  }
}
