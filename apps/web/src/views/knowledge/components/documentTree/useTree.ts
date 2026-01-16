// 一些树的通用方法(整合了antd官网示例)
import { computed, ref, watch, type ComputedRef } from 'vue'
import { type DocumentNodeTreeItem, type DragDocumentParams } from '@sk/types'
import { useRouter, useRoute } from 'vue-router'
import { cloneDeep } from 'lodash-es'
import { treeToArray, getNodePath } from '@sk/utils'
import type {
  AntTreeNodeDragEnterEvent,
  AntTreeNodeDropEvent,
  TreeProps,
} from 'ant-design-vue/es/tree'
export const useTree = (treeData: ComputedRef<DocumentNodeTreeItem[]>, emit: any) => {
  const router = useRouter()
  const route = useRoute()
  const transformedTree = ref<DocumentNodeTreeItem[]>([])
  const hasInitialized = ref(false)
  // 使用 Map 统一管理所有节点的 UI 临时状态
  type NodeUIState = {
    showActions: boolean
    moreOpen: boolean
    addOpen: boolean
    renaming: boolean
  }
  // 扁平化数据结构（这里不关心顺序）
  const flattenedTree = computed(() => {
    return treeToArray(treeData.value, {
      keepChildren: false, // 不保留children
    })
  })
  const nodeUIStateMap = ref<Map<string, NodeUIState>>(new Map())
  /**
   * 获取节点 UI 状态
   */
  const getNodeUIState = (nodeId: string, key: keyof NodeUIState): any => {
    const state = nodeUIStateMap.value.get(nodeId)
    if (!state) {
      const defaultState: NodeUIState = {
        showActions: false,
        moreOpen: false,
        addOpen: false,
        renaming: false,
      }
      nodeUIStateMap.value.set(nodeId, defaultState)
      return defaultState[key]
    }
    return state[key]
  }
  /**
   * 设置节点 UI 状态
   */
  const setNodeUIState = (nodeId: string, updates: Partial<NodeUIState>) => {
    const currentState = nodeUIStateMap.value.get(nodeId) || {
      showActions: false,
      moreOpen: false,
      addOpen: false,
      renaming: false,
    }
    nodeUIStateMap.value.set(nodeId, { ...currentState, ...updates })
  }
  const expandedKeys = ref<string[]>([])
  const activeKey = computed(() => {
    // 查找树中选中项对应id
    const activeNode = flattenedTree.value.find(
      (item) => item.document_slug === route.params.document_slug,
    )
    if (activeNode) {
      return activeNode.id
    }
    return ''
  })

  const handleTreeSelect = (_: any, e: { selected: boolean; node: any }) => {
    console.log(e.node)
    if (e.node.document_slug) {
      router.push(`/knowledge/${route.params.slug}/document/${e.node.document_slug}`)
    }
  }

  const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log(info)
    // expandedKeys 需要展开时
    // expandedKeys.value = info.expandedKeys;
  }
  const onDrop = (info: AntTreeNodeDropEvent) => {
    console.log(info)
    const dropKey = info.node.id
    const dragKey = info.dragNode.id
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
      data.forEach((item, index) => {
        if (item.id === key) {
          return callback(item, index, data)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }
    const data = [...transformedTree.value] // 注意这里使用浅拷贝

    // Find dragObject
    let dragObj: DocumentNodeTreeItem
    loop(data, dragKey, (item: DocumentNodeTreeItem, index: number, arr: TreeProps['treeData']) => {
      arr.splice(index, 1)
      dragObj = item
    })
    // 判断是否是根节点
    if (!info.dropToGap) {
      // 非间隙内（插入到节点内部）
      // Drop on the content
      loop(data, dropKey, (item: DocumentNodeTreeItem) => {
        item.children = item.children || []
        /// where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj)
      })
    } else if (
      (info.node.children || []).length > 0 && // Has children
      info.node.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: DocumentNodeTreeItem) => {
        item.children = item.children || []
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj)
      })
    } else {
      let ar: TreeProps['treeData'] = []
      let i = 0
      loop(
        data,
        dropKey,
        (_item: DocumentNodeTreeItem, index: number, arr: TreeProps['treeData']) => {
          ar = arr
          i = index
        },
      )
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }
    transformedTree.value = data
    // 构建操作请求：{action: 'moveAfter' | 'prependChild', node_id, target_id}
    const operation: DragDocumentParams = {
      action: dropPosition === 0 ? 'prependChild' : dropPosition < 0 ? 'moveBefore' : 'moveAfter',
      node_id: dragKey as string,
      target_id: dropKey as string,
    }
    if (!emit) {
      console.warn('请传入emit参数')
      return
    }
    emit('drag-document-end', {
      newTree: transformedTree.value,
      operation,
    })
  }
  const initExpandedKeys = () => {
    // 这里要判断一下
    if (expandedKeys.value.includes(activeKey.value)) return // 如果已经展开了，则不重新展开
    expandedKeys.value = getNodePath(transformedTree.value, activeKey.value, {
      onlyKey: true,
      excludeSelf: true,
    }) as string[]
  }
  // 监听外部变化
  watch(
    treeData,
    (newVal) => {
      transformedTree.value = cloneDeep(newVal)
      // 初始化展开keys
      if (activeKey.value && !hasInitialized.value) {
        initExpandedKeys()
        hasInitialized.value = true
      }
    },
    {
      deep: true,
      immediate: true, // 初始化时立即执行（防止切换会首页不显示）
    },
  )
  watch(activeKey, () => {
    if (activeKey.value) {
      initExpandedKeys()
    }
  })
  return {
    transformedTree,
    activeKey,
    expandedKeys,
    onDragEnter,
    handleTreeSelect,
    onDrop,
    getNodeUIState,
    setNodeUIState,
    initExpandedKeys,
  }
}
