// store/useKnowledgeStore.ts
// 存放当前进入的知识库相关信息
import { defineStore, storeToRefs } from 'pinia'
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
import { message } from 'ant-design-vue'
// 获取当前知识库详情
import { knowledge as knowledgeApi } from '@sk/api'
import type { DragDocumentParams } from '@sk/types'
import { arrayToTree } from '@sk/utils'
import { useUserStore } from './useUserStore'
export const useKnowledgeStore = defineStore('knowledge', () => {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
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
    team: {
      id: '',
      name: '',
      slug: '',
      description: '',
      icon: '',
      visibility: true,
      owner_id: 0,
      space_id: '',
      created_at: '',
      updated_at: '',
    },
  })
  const knowledgeError = ref<{ errMessage: string } | null>(null)
  const showKnowledgeLeftPanel = ref(true); // 是否显示知识库左侧面板（默认显示,仅有文档权限下不显示）
  const breadcrumbName = computed(() => {
    return knowledgeInfo.value.team.owner_id === userStore.userInfo.id ? '个人知识库' : knowledgeInfo.value.team.name
  })
  const currentKnowledgeSlug = computed(() => route.params.knowledge_slug as string)
  const document_slug = computed(() => {
    return (route.params.document_slug as string) || ''
  })
  const documentError = ref<{ errMessage: string } | null>(null)
  // 当前选中的文档
  const documentInfo = ref<DocumentItem>({
    id: '',
    userId: '',
    type: DocumentType.WORD,
    name: '',
    slug: '',
    has_collected: false,
    is_public: false,
    knowledge_id: '',
    view_count: 0,
    content_updated_at: '',
    created_at: '',
    updated_at: '',
  })
  const documentContentJson = ref<string | null>(null)
  const showEditor = ref(false) // 是否显示编辑器（用于处理不同文档切换时序问题）
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
  // 扁平化的文档树
  const flattenDocumentTree = ref<DocumentNodeTreeItem[]>([])
  // 左侧选中的节点
  const currentDocNode = computed(() => {
    return (
      flattenDocumentTree.value.find(
        (item: DocumentNodeTreeItem) => item.document_slug === document_slug.value,
      ) || { ...defaultDocumentNode }
    )
  })
  // 构建一个中间态（这里不去动之前的currentDocNode，构建一个类似的结构，组合一下）
  const currentDocState = computed(() => {
    return showKnowledgeLeftPanel.value ? currentDocNode.value : {
      id: 'doc_node',
      type: DocumentType.WORD,
      document_slug: document_slug.value,
      title: documentInfo.value.name,
      parent_id: '',
      first_child_id: '',
      document_id: documentInfo.value.id,
      prev_id: '',
      next_id: '',
      mode: 'preview',
    }
  })
  const initDocumentTree = async () => {
    documentLoading.value = true
    const [error, res] = await to(knowledgeApi.getDocumentNodesTreeById(knowledgeInfo.value.id))
    if (error) {
      return
    }
    documentLoading.value = false

    // 初始化一些 中间态

    flattenDocumentTree.value = res.data
      ? res.data.map((item) => ({ ...item, mode: 'preview' }))
      : []
    // 转换为树结构
    documentTree.value = arrayToTree(flattenDocumentTree.value, {
      useChainOrder: true,
    })
    console.log('documentTree.value', documentTree.value)
  }

  // 更新文档属性(支持通过id或slug更新)
  const updateDocumentAttrs = (identifier: string, attrs: Partial<DocumentNodeTreeItem>) => {
    const index = flattenDocumentTree.value.findIndex(
      (item) => item.document_id === identifier || item.document_slug === identifier,
    )
    if (index !== -1) {
      Object.entries(attrs).forEach(([key, value]) => {
        const item = flattenDocumentTree.value[index]!
        if (item) {
          item[key as keyof DocumentNodeTreeItem] = value as never
        }
      })
    }
    documentTree.value = arrayToTree(flattenDocumentTree.value, {
      useChainOrder: true,
    })
  }
  const initKnowledge = async () => {
    const [error, res] = await to(
      knowledgeApi.getKnowledgeDetail(currentKnowledgeSlug.value as string, !!document_slug.value),
    )
    console.log('获取知识库列表:', res)
    if (!error) {
      knowledgeInfo.value = res.data
      // 获取知识库下面的文档树
      initDocumentTree()
    } else {
      if (!document_slug.value) {
        const errorRes = (error as any)?.response?.data as {
          errCode: number;
          errMessage?: string;
        };
        if (errorRes?.errCode === 403) {
          knowledgeError.value = { errMessage: errorRes.errMessage || '你无权访问此知识库' }
        }
      } else {
        // 如果是文档访问，则不显示左侧面板
        showKnowledgeLeftPanel.value = false
      }
    }
  }
  // 获取当前文档的内容信息
  const getDocumentContent = async (documentId: string) => {
    const [error, res] = await to(documentApi.getDocumentContent(documentId))
    if (error) {
      return
    }
    documentContentJson.value = res.data ? JSON.parse(res.data)?.default : null
  }
  const initDocumentDetail = async (showLoading = true) => {
    showEditor.value = false
    const [error, res] = await to(documentApi.getDocumentDetail(document_slug.value))
    if (!error) {
      documentInfo.value = res.data
      showLoading && currentDocNode.value.mode === 'edit' && message.loading('文档初始化中...', 0.5)
      showEditor.value = true
      if (documentInfo.value.id && currentDocNode.value.mode === 'preview') {
        getDocumentContent(documentInfo.value.id)
      }
    } else {
      const errorRes = (error as any)?.response?.data as {
        errCode: number;
        errMessage?: string;
      };
      if (errorRes?.errCode === 403) {
        documentError.value = { errMessage: errorRes.errMessage || '你无权访问此文档' }
      }
    }
  }
  // 文档更新(追加触发方式：编辑器自身触发不用更新后端二进制文件)
  const handleUpdateDocumentName = async (
    documentId: string,
    text: string,
    trigger: 'outer' | 'editor' = 'outer',
    cb?: any,
  ) => {
    // debugger;
    const [error, res] = await to(
      documentApi.updateDocument(documentId, {
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

  // 删除文档后跳转下一个文档
  const setNextDocumentNode = (nodeId: string) => {
    if (!nodeId || nodeId !== currentDocNode.value.id) {
      // 如果删除不是当前选中，则不管
      return
    }
    if (flattenDocumentTree.value.length === 1) {
      // 跳转知识库首页
      router.push(`/knowledge/${currentKnowledgeSlug.value}`)
      return
    }
    const index = flattenDocumentTree.value.findIndex((item) => item.id === nodeId)
    if (index !== -1) {
      if (index === documentTree.value.length - 1) {
        // 如果是最后一项，则找上一个
        const prevNode = flattenDocumentTree.value[index - 1]
        if (prevNode) {
          router.push(`/knowledge/${currentKnowledgeSlug.value}/document/${prevNode.document_slug}`)
        }
      } else {
        // 找下一个
        const nextNode = flattenDocumentTree.value[index + 1]
        if (nextNode) {
          router.push(`/knowledge/${currentKnowledgeSlug.value}/document/${nextNode.document_slug}`)
        }
      }
    }
  }

  // 删除文档
  const deleteDocument = async (document_id: string) => {
    // 查找当前文档对应的node节点
    const node = flattenDocumentTree.value.find(
      (item) => item.document_id === document_id,
    )

    const [error, res] = await to(documentApi.deleteDocument(document_id))
    if (!error) {
      setNextDocumentNode(node ? node.id : '')
      initDocumentTree()
    }
  }
  // 拖拽树结束
  const handleDragDocumentEnd = async (params: {
    newTree: DocumentNodeTreeItem[],
    operation: DragDocumentParams
  }) => {
    const [error] = await to(documentApi.dragDocument(params.operation))
    if (error) {
      return
    }
    documentTree.value = params.newTree; // 同步最新的树
  }


  return {
    // 状态
    knowledgeInfo,
    knowledgeError,
    documentInfo,
    documentError,
    documentContentJson,
    documentTree,
    documentLoading,
    currentDocState,
    breadcrumbName,
    showKnowledgeLeftPanel,
    showEditor,
    // 方法
    initKnowledge,
    initDocumentTree,
    updateDocumentAttrs,
    initDocumentDetail,
    handleUpdateDocumentName,
    handleDragDocumentEnd,
    deleteDocument,
  }
})
