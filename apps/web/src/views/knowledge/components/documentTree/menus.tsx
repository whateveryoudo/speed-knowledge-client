import {
  EditOutlined,
  CopyOutlined,
  DeliveredProcedureOutlined,
  DeleteOutlined,
  FormOutlined,
} from '@ant-design/icons-vue'
import type { ItemType } from 'ant-design-vue'
export const documentMoreMenus: ItemType[] = [
  { icon: <EditOutlined />, key: 'rename', label: '重命名' },
  { icon: <FormOutlined />, label: '编辑文档', key: 'edit' },
  {
    icon: <CopyOutlined />,
    label: '复制',
    key: 'copy',
  },
  {
    icon: <DeliveredProcedureOutlined />,
    label: '移动',
    key: 'move',
  },
  {
    type: 'divider',
  },
  {
    icon: <DeleteOutlined />,
    label: '删除',
    key: 'delete',
    danger: true,
  },
]
