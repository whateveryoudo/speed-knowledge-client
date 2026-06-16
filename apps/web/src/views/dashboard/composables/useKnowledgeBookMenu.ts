import { h, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { ItemType } from 'ant-design-vue'
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  IdcardOutlined,
  PushpinOutlined,
} from '@ant-design/icons-vue'
import { KnowledgeAbility, type KnowledgeItem } from '@sk/types'
import { useKnowledgeList } from './useKnowledgeListContext'

export interface KnowledgeBookMenuOptions {
  /** 是否已在常用列表 */
  isPinned?: boolean
}

type MenuItem = ItemType & { hidden?: boolean }

export function useKnowledgeBookMenu() {
  const router = useRouter()
  const { handleRemoveUsual, handleAddUsual, handleRename } = useKnowledgeList()

  const deleteKnowledgeVisible = ref(false)
  const renamingBookId = ref<string | null>(null)
  const renameInputRef = ref<HTMLInputElement | null>(null)
  const currentBook: Ref<KnowledgeItem | null> = ref(null)

  const isRenaming = (bookId: string) => renamingBookId.value === bookId

  const startRename = (book: KnowledgeItem) => {
    renamingBookId.value = book.id
    setTimeout(() => {
      renameInputRef.value?.focus()
    }, 100)
  }

  const handleRenameBlur = async (value: string, book: KnowledgeItem) => {
    if (!isRenaming(book.id)) {
      return
    }
    const name = value.trim()
    if (!name || name === book.name) {
      renamingBookId.value = null
      return
    }
    await handleRename(book.id, name, () => {
      message.success('重命名成功')
      renamingBookId.value = null
    })
  }

  const buildMenuItems = (
    book: KnowledgeItem,
    options: KnowledgeBookMenuOptions = {},
  ): ItemType[] => {
    const { isPinned = false } = options
    const canDelete = !!book.ability?.[KnowledgeAbility.DELETE_BOOK]
    const canRename = !!book.ability?.[KnowledgeAbility.MODIFY_BOOK_SETTING]
    const showExit = !canDelete

    const items: MenuItem[] = [
      {
        label: isPinned ? '移出常用' : '设为常用',
        key: isPinned ? 'unpin' : 'pin',
        icon: () => h(PushpinOutlined),
      },
      {
        label: '权限',
        key: 'auth',
        icon: () => h(IdcardOutlined),
      },
      {
        label: '重命名',
        key: 'rename',
        icon: () => h(EditOutlined),
        hidden: !canRename,
      },
      {
        type: 'divider',
        hidden: !canDelete && !showExit,
      },
      {
        label: '删除',
        key: 'delete',
        danger: true,
        icon: () => h(DeleteOutlined),
        hidden: !canDelete,
      },
      {
        label: '退出知识库',
        key: 'exit',
        danger: true,
        icon: () => h(ExportOutlined),
        hidden: !showExit,
      },
    ]

    return items.filter((item) => !item.hidden)
  }

  const handleMenuClick = async (
    key: string,
    book: KnowledgeItem,
  ) => {
    currentBook.value = book

    switch (key) {
      case 'auth':
        router.push(`/${book.team.slug}/knowledge/${book.slug}/manage/auth`)
        break
      case 'unpin':
        await handleRemoveUsual(book.id)
        message.success('已移出常用')
        break
      case 'pin':
        await handleAddUsual(book.id)
        message.success('已设为常用')
        break
      case 'rename':
        startRename(book)
        break
      case 'delete':
        deleteKnowledgeVisible.value = true
        break
      case 'exit':
        // 退出逻辑由后端补充，前端暂不调用接口
        break
      default:
        break
    }
  }

  return {
    buildMenuItems,
    handleMenuClick,
    deleteKnowledgeVisible,
    renamingBookId,
    renameInputRef,
    isRenaming,
    handleRenameBlur,
    currentBook,
  }
}
