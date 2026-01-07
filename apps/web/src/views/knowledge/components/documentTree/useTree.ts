// 一些树的通用方法(整合了antd官网示例)
import { computed, ref, watch, type ComputedRef } from 'vue'
import { type DocumentNodeTreeItem } from '@sk/types'
import { useRouter, useRoute } from 'vue-router'
import { cloneDeep } from 'lodash-es'
import type {
  AntTreeNodeDragEnterEvent,
  AntTreeNodeDropEvent,
  TreeProps,
} from 'ant-design-vue/es/tree'
export const useTree = (treeData: ComputedRef<DocumentNodeTreeItem[]>) => {
  const router = useRouter()
  const route = useRoute()
  const transformedTree = ref<DocumentNodeTreeItem[]>([])

  const activeKey = computed(() => {
    return (route.params.document_slug as string) || ''
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
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
    const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
      data.forEach((item, index) => {
        if (item.key === key) {
          return callback(item, index, data)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }
    const data = [...treeData]

    // Find dragObject
    let dragObj: DocumentNodeTreeItem
    loop(data, dragKey, (item: DocumentNodeTreeItem, index: number, arr: TreeProps['treeData']) => {
      arr.splice(index, 1)
      dragObj = item
    })
    if (!info.dropToGap) {
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
  }
  // 监听外部变化
  watch(treeData, (newVal) => {
    transformedTree.value = cloneDeep(newVal)
  })

  return {
    transformedTree,
    activeKey,
    onDragEnter,
    handleTreeSelect,
    onDrop,
  }
}
