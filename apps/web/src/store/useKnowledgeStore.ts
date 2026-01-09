// store/useKnowledgeStore.ts
// 存放当前进入的知识库相关信息
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  type KnowledgeItem,
  type DocumentItem,
  type DocumentNodeTreeItem,
  DocumentType,
} from '@sk/types'
import { to } from 'await-to-js'
import { document as documentApi } from '@sk/api'
import { useRouter, useRoute } from 'vue-router'
// 获取当前知识库详情
import { knowledge as knowledgeApi } from '@sk/api'
export const useKnowledgeStore = defineStore('knowledge', () => {
  const router = useRouter()
  const route = useRoute()
  // 当前知识库信息
  const knowledgeInfo = ref<KnowledgeItem>({
    id: '',
    name: '',
    description: '',
    group_id: '',
    icon: '',
    user_id: 0,
    slug: '',
    cover_url: null,
    is_public: false,
    items_count: 0,
    content_updated_at: '',
    created_at: '',
    updated_at: '',
  })
  const currentKnowledgeSlug = computed(() => route.params.slug as string)
  const document_slug = computed(() => {
    return (route.params.document_slug as string) || ''
  })
  // 当前选中的文档
  const documentInfo = ref<DocumentItem>({
    id: '',
    userId: '',
    type: DocumentType.WORD,
    name: '',
    slug: '',
    is_public: false,
    knowledge_id: '',
    view_count: 0,
    content_updated_at: '',
    created_at: '',
    updated_at: '',
  })
  const documentContentJson = ref<string | null>(null)

  const defaultDocumentNode: DocumentNodeTreeItem = {
    id: '',
    type: DocumentType.WORD,
    document_slug: '',
    title: '',
    parent_id: '',
    first_child_id: '',
    document_id: '',
    prev_id: '',
    next_id: '',
    knowledge_id: '',
    created_at: '',
    updated_at: '',
    mode: 'preview',
  }
  const documentLoading = ref(false)
  // 当前知识库下的文档树
  const documentTree = ref<DocumentNodeTreeItem[]>([])
  // 左侧选中的节点
  const currentDocNode = computed(() => {
    return (
      documentTree.value.find(
        (item: DocumentNodeTreeItem) => item.document_slug === document_slug.value,
      ) || { ...defaultDocumentNode }
    )
  })
  const initDocumentTree = async () => {
    documentLoading.value = true
    const [error, res] = await to(knowledgeApi.getDocumentNodesTreeById(knowledgeInfo.value.id))
    if (error) {
      return
    }
    documentLoading.value = false

    // 初始化一些 中间态

    documentTree.value = res.data
      ? res.data.map((item: DocumentNodeTreeItem) => ({
          ...item,
          mode: 'preview', // 默认预览模式
        }))
      : []
  }

  // 更新文档属性
  const updateDocumentAttrs = (id: string, attrs: Partial<DocumentNodeTreeItem>) => {
    const index = documentTree.value.findIndex((item) => item.document_id === id)
    if (index !== -1) {
      Object.entries(attrs).forEach(([key, value]) => {
        const item = documentTree.value[index]!
        if (item) {
          item[key as keyof DocumentNodeTreeItem] = value as never
        }
      })
    }
  }
  const initKnowledge = async () => {
    const [error, res] = await to(
      knowledgeApi.getKnowledgeDetail(currentKnowledgeSlug.value as string),
    )
    console.log('获取知识库列表:', res)
    if (!error) {
      knowledgeInfo.value = res.data
      // 获取知识库下面的文档树
      initDocumentTree()
    }
  }
  // 获取当前文档的内容信息
  const getDocumentContent = async (documentId: string) => {
    const [error, res] = await to(documentApi.getDocumentContent(documentId))
    if (error) {
      return
    }
    documentContentJson.value = res.data ? JSON.parse(res.data) : null
  }
  const initDocumentDetail = async () => {
    const [error, res] = await to(documentApi.getDocumentDetail(document_slug.value))
    if (!error) {
      documentInfo.value = res.data
      if (documentInfo.value.id && currentDocNode.value.mode === 'preview') {
        getDocumentContent(documentInfo.value.id)
      }
    }
  }
  // 文档更新(追加触发方式：编辑器自身触发不用更新后端二进制文件)
  const handleUpdateDocumentName = async (
    text: string,
    trigger: 'outer' | 'editor' = 'outer',
    cb?: any,
  ) => {
    const [error, res] = await to(
      documentApi.updateDocument(documentInfo.value.id, {
        name: text,
        trigger,
      }),
    )
    if (!error) {
      documentInfo.value = res.data
      // 同步节点树中的文档名称
      updateDocumentAttrs(documentInfo.value.id, {
        title: text,
      })
      if (cb && typeof cb === 'function') {
        cb()
      }
    }
  }

  return {
    // 状态
    documentInfo,
    documentContentJson,
    knowledgeInfo,
    documentTree,
    documentLoading,
    currentDocNode,

    // 方法
    initKnowledge,
    initDocumentTree,
    updateDocumentAttrs,
    initDocumentDetail,
    handleUpdateDocumentName,
  }
})
