// store/useKnowledgeStore.ts
// 存放当前进入的知识库相关信息
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import {
  type KnowledgeItem,
  type DocumentItem,
  type DocumentNodeItem,
  type DocumentNodeTreeItem,
  type DocumentNodeUIState,
  type TreeNodeUIState,
  DocumentType,
} from '@sk/types'
import type { WorkbookSnapshot } from '@speed-sheet/shared'
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
    team_id: '',
    space_id: '',
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
  const documentSheetSnapshot = ref<WorkbookSnapshot | null>(null)
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

  const defaultTreeNodeUIState = (): TreeNodeUIState => ({
    showActions: false,
    moreOpen: false,
    addOpen: false,
    renaming: false,
  })
  const nodeUIStateMap = ref<Record<string, TreeNodeUIState>>({})
  const focusRenameNodeId = ref<string | null>(null)

  const getNodeUIState = (nodeId: string, key: keyof TreeNodeUIState) => {
    return nodeUIStateMap.value[nodeId]?.[key] ?? defaultTreeNodeUIState()[key]
  }

  const setNodeUIState = (nodeId: string, updates: Partial<TreeNodeUIState>) => {
    nodeUIStateMap.value = {
      ...nodeUIStateMap.value,
      [nodeId]: {
        ...defaultTreeNodeUIState(),
        ...nodeUIStateMap.value[nodeId],
        ...updates,
      },
    }
    if (updates.renaming) {
      focusRenameNodeId.value = nodeId
    }
  }

  const clearFocusRenameNode = () => {
    focusRenameNodeId.value = null
  }

  const clearNodeUIState = (nodeId: string) => {
    const { [nodeId]: _, ...rest } = nodeUIStateMap.value
    nodeUIStateMap.value = rest
  }

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
      type: documentInfo.value.type,
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
  // 将接口节点转换为前端文档树节点
  const toTreeNode = (node: DocumentNodeItem, attrs: DocumentNodeUIState = {}): DocumentNodeTreeItem => ({
    ...node,
    document_slug: node.document_slug ?? '',
    parent_id: node.parent_id ?? '',
    first_child_id: node.first_child_id ?? '',
    prev_id: node.prev_id ?? '',
    next_id: node.next_id ?? '',
    mode: 'preview',
    ...attrs,
  })

  const rebuildDocumentTree = () => {
    documentTree.value = arrayToTree(flattenDocumentTree.value, {
      useChainOrder: true,
    })
  }

  const findNodeIndex = (identifier: string) =>
    flattenDocumentTree.value.findIndex(
      (item) =>
        item.id === identifier
        || item.document_id === identifier
        || item.document_slug === identifier,
    )

  /** 合并更新节点（支持 nodeId / documentId / documentSlug） */
  const updateNode = (identifier: string, attrs: Partial<DocumentNodeTreeItem>) => {
    const index = findNodeIndex(identifier)
    if (index === -1) {
      return
    }
    Object.assign(flattenDocumentTree.value[index]!, attrs)
    rebuildDocumentTree()
  }

  const patchNodeById = (nodeId: string, attrs: Partial<DocumentNodeTreeItem>) => {
    const index = flattenDocumentTree.value.findIndex((item) => item.id === nodeId)
    if (index === -1) {
      return
    }
    Object.assign(flattenDocumentTree.value[index]!, attrs)
  }

  const syncSiblingLinksForInsert = (node: DocumentNodeTreeItem) => {
    // 后端 create_node 将新节点插入 sibling 链头部：new.next = 原第一个，原第一个.prev = new
    if (node.next_id) {
      patchNodeById(node.next_id, { prev_id: node.id })
    }
    if (node.parent_id) {
      const parent = flattenDocumentTree.value.find((item) => item.id === node.parent_id)
      if (parent && (!parent.first_child_id || parent.first_child_id === node.next_id)) {
        patchNodeById(node.parent_id, { first_child_id: node.id })
      }

    }
  }

  const initDocumentTree = async () => {
    documentLoading.value = true
    const [error, res] = await to(knowledgeApi.getDocumentNodesTreeById(knowledgeInfo.value.id))
    documentLoading.value = false
    if (error) {
      return
    }

    flattenDocumentTree.value = res.data
      ? res.data.map((item) => toTreeNode(item))
      : []
    rebuildDocumentTree()
  }

  const appendDocumentNode = (node: DocumentNodeItem) => {
    const treeNode = toTreeNode(node)
    syncSiblingLinksForInsert(treeNode)
    debugger;
    flattenDocumentTree.value.push(treeNode)
    rebuildDocumentTree()
  }

  const collectDescendantIds = (rootId: string): string[] => {
    const result: string[] = []
    const queue = flattenDocumentTree.value
      .filter((item) => item.parent_id === rootId)
      .map((item) => item.id)

    while (queue.length > 0) {
      const id = queue.shift()!
      result.push(id)
      flattenDocumentTree.value
        .filter((item) => item.parent_id === id)
        .forEach((item) => queue.push(item.id))
    }

    return result
  }

  const removeDocumentNode = (nodeId: string) => {
    const node = flattenDocumentTree.value.find((item) => item.id === nodeId)
    if (!node) {
      return
    }

    const idsToRemove = new Set([nodeId, ...collectDescendantIds(nodeId)])

    if (node.prev_id && !idsToRemove.has(node.prev_id)) {
      patchNodeById(node.prev_id, {
        next_id: node.next_id && !idsToRemove.has(node.next_id) ? node.next_id : '',
      })
    }
    if (node.next_id && !idsToRemove.has(node.next_id)) {
      patchNodeById(node.next_id, {
        prev_id: node.prev_id && !idsToRemove.has(node.prev_id) ? node.prev_id : '',
      })
    }

    if (node.parent_id && !idsToRemove.has(node.parent_id)) {
      const parent = flattenDocumentTree.value.find((item) => item.id === node.parent_id)
      if (parent?.first_child_id === node.id) {
        patchNodeById(node.parent_id, {
          first_child_id: node.next_id && !idsToRemove.has(node.next_id) ? node.next_id : '',
        })
      }
    }

    flattenDocumentTree.value = flattenDocumentTree.value.filter(
      (item) => !idsToRemove.has(item.id),
    )
    idsToRemove.forEach((id) => clearNodeUIState(id))
    rebuildDocumentTree()
  }

  const handleRenameNode = async (
    params: { nodeId: string; documentId?: string; title: string },
    cb?: () => void,
  ) => {
    if (params.documentId) {
      await handleUpdateDocumentName(params.documentId, params.title, 'outer', cb)
      return
    }
    updateNode(params.nodeId, { title: params.title })
    cb?.()
  }

  const handleEditDocument = (nodeId: string, documentSlug: string) => {
    updateNode(nodeId, { mode: 'edit' })
    router.push(
      `/${route.params.team_slug as string}/knowledge/${currentKnowledgeSlug.value}/document/${documentSlug}`,
    )
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
    const parsed = res.data ? JSON.parse(res.data) : null
    if (documentInfo.value.type === DocumentType.SHEET) {
      documentSheetSnapshot.value = parsed
      documentContentJson.value = null
    } else {
      documentContentJson.value = parsed?.default ?? null
      documentSheetSnapshot.value = null
    }
  }
  const initDocumentDetail = async (showLoading = true) => {
    showEditor.value = false
    documentContentJson.value = null
    documentSheetSnapshot.value = null
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
      updateNode(documentInfo.value.id, {
        title: text,
      })
      if (cb && typeof cb === 'function') {
        cb()
      }
    }
  }

  const findNavigableDocNode = (startIndex: number, step: 1 | -1) => {
    const flat = flattenDocumentTree.value
    for (let i = startIndex; i >= 0 && i < flat.length; i += step) {
      const node = flat[i]
      if (node?.document_slug) {
        return node
      }
    }
    return null
  }

  // 删除后：若当前页在被删节点（或其子树）内，则跳转相邻文档或知识库首页
  const setNextDocumentNode = (removedNodeIds: Set<string>) => {
    const currentNodeId = currentDocNode.value.id
    if (!currentNodeId || !removedNodeIds.has(currentNodeId)) {
      return
    }

    const flatBeforeRemove = flattenDocumentTree.value
    const index = flatBeforeRemove.findIndex((item) => item.id === currentNodeId)
    if (index === -1) {
      return
    }

    const teamSlug = route.params.team_slug as string
    const knowledgePath = `/${teamSlug}/knowledge/${currentKnowledgeSlug.value}`
    const remaining = flatBeforeRemove.filter((item) => !removedNodeIds.has(item.id))
    const navigableRemaining = remaining.filter((item) => item.document_slug)

    if (navigableRemaining.length === 0) {
      router.push(knowledgePath)
      return
    }

    const nextNode =
      findNavigableDocNode(index + 1, 1) ??
      findNavigableDocNode(index - 1, -1)

    if (nextNode?.document_slug) {
      router.push(`${knowledgePath}/document/${nextNode.document_slug}`)
      return
    }

    router.push(knowledgePath)
  }

  // 删除文档树节点（目录 / 文档统一走 nodeId）
  const deleteTreeNode = async (nodeId: string, cb?: (res: any) => void) => {
    const descendantIds = collectDescendantIds(nodeId)
    const removedNodeIds = new Set([nodeId, ...descendantIds])

    const [error, res] = await to(documentApi.deleteDocumentNode(nodeId))
    if (!error) {
      setNextDocumentNode(removedNodeIds)
      removeDocumentNode(nodeId)
      cb?.(res)
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
    documentSheetSnapshot,
    documentTree,
    documentLoading,
    nodeUIStateMap,
    focusRenameNodeId,
    currentDocState,
    breadcrumbName,
    showKnowledgeLeftPanel,
    showEditor,
    // 方法
    initKnowledge,
    initDocumentTree,
    appendDocumentNode,
    removeDocumentNode,
    updateNode,
    initDocumentDetail,
    handleUpdateDocumentName,
    handleDragDocumentEnd,
    deleteTreeNode,
    getNodeUIState,
    setNodeUIState,
    clearFocusRenameNode,
    handleRenameNode,
    handleEditDocument,
  }
})
