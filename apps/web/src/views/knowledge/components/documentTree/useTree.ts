// 树的通用方法：展开、选中、拖拽（不含节点 UI 临时态）
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

  const flattenedTree = computed(() => {
    return treeToArray(treeData.value, {
      keepChildren: false,
    })
  })

  const expandedKeys = ref<string[]>([])
  const activeKey = computed(() => {
    const activeNode = flattenedTree.value.find(
      (item) => item.document_slug === route.params.document_slug,
    )
    return activeNode?.id ?? ''
  })

  const handleTreeSelect = (_: any, e: { selected: boolean; node: any }) => {
    if (e.node.document_slug) {
      router.push(`/${route.params.team_slug as string}/knowledge/${route.params.knowledge_slug as string}/document/${e.node.document_slug}`)
    }
  }

  const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
    console.log(info)
  }

  const onDrop = (info: AntTreeNodeDropEvent) => {
    const dropKey = info.node.id
    const dragKey = info.dragNode.id
    const dropPos = info.node.pos?.split('-') ?? []
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
      data?.forEach((item, index) => {
        if (item.id === key) {
          return callback(item, index, data)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }
    const data = [...transformedTree.value]

    let dragObj!: DocumentNodeTreeItem
    loop(data, dragKey, (item: DocumentNodeTreeItem, index: number, arr: TreeProps['treeData']) => {
      arr?.splice(index, 1)
      dragObj = item
    })
    if (!info.dropToGap) {
      loop(data, dropKey, (item: DocumentNodeTreeItem) => {
        item.children = item.children || []
        item.children.unshift(dragObj)
      })
    } else if (
      (info.node.children || []).length > 0
      && info.node.expanded
      && dropPosition === 1
    ) {
      loop(data, dropKey, (item: DocumentNodeTreeItem) => {
        item.children = item.children || []
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
        ar?.splice(i, 0, dragObj)
      } else {
        ar?.splice(i + 1, 0, dragObj)
      }
    }
    transformedTree.value = data
    const operation: DragDocumentParams = {
      action: dropPosition === 0 ? 'prependChild' : dropPosition < 0 ? 'moveBefore' : 'moveAfter',
      node_id: dragKey as string,
      target_id: dropKey as string,
    }
    emit('drag-document-end', {
      newTree: transformedTree.value,
      operation,
    })
  }

  const initExpandedKeys = () => {
    if (!hasInitialized.value) {
      expandedKeys.value = transformedTree.value.map((item) => item.id)
    }
    if (expandedKeys.value.includes(activeKey.value)) return
    if (activeKey.value) {
      const activeKeyPaths = getNodePath(transformedTree.value, activeKey.value, {
        onlyKey: true,
        excludeSelf: true,
      })
      expandedKeys.value = [...new Set([...expandedKeys.value, ...activeKeyPaths])] as string[]
    }
  }

  watch(
    treeData,
    (newVal) => {
      transformedTree.value = cloneDeep(newVal)
      if (!hasInitialized.value && newVal.length > 0) {
        initExpandedKeys()
        hasInitialized.value = true
      }
    },
    {
      deep: true,
      immediate: true,
    },
  )

  return {
    transformedTree,
    activeKey,
    expandedKeys,
    onDragEnter,
    handleTreeSelect,
    onDrop,
  }
}
