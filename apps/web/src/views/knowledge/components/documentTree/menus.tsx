import {
  EditOutlined,
  CopyOutlined,
  DeliveredProcedureOutlined,
  DeleteOutlined,
  FormOutlined,
  ExportOutlined,
} from '@ant-design/icons-vue'
import type { ItemType } from 'ant-design-vue'

export type DocumentMoreMenuAbility = {
  canEdit: boolean
  canCreate: boolean
  canDelete: boolean
  canExport?: boolean
}

export function buildDocumentMoreMenus({
  canEdit,
  canCreate,
  canDelete,
  canExport = false,
}: DocumentMoreMenuAbility): ItemType[] {
  const items: ItemType[] = []

  if (canEdit) {
    items.push(
      { icon: <EditOutlined />, key: 'rename', label: '重命名' },
      { icon: <FormOutlined />, label: '编辑文档', key: 'edit' },
    )
  }
  if (canCreate) {
    items.push({
      icon: <CopyOutlined />,
      label: '复制',
      key: 'copy',
    })
  }
  if (canEdit) {
    items.push({
      icon: <DeliveredProcedureOutlined />,
      label: '移动',
      key: 'move',
    })
  }
  if (canExport) {
    items.push({
      icon: <ExportOutlined />,
      label: '导出',
      key: 'export',
    })
  }
  if (canDelete) {
    if (items.length > 0) {
      items.push({ type: 'divider' })
    }
    items.push({
      icon: <DeleteOutlined />,
      label: '删除',
      key: 'delete',
      danger: true,
    })
  }

  return items
}
