import { CollaboratorRole } from "./collaborator";
// 节点类型：目前只有目录和DOC
export enum DocumentNodeType {
  TITLE = "TITLE",
  DOC = "DOC",
}
export enum DocumentType {
  WORD = "word",
  SHEET = "sheet",
  GROUP = "group",
}

export const documentTypeOptions = [
  {
    label: '文档',
    value: DocumentType.WORD,
    icon: 'icon-document',
  },
  {
    label: '表格',
    value: DocumentType.SHEET,
    icon: 'icon-sheet',
  },
  {
    label: '分组',
    value: DocumentType.GROUP,
    icon: 'icon-group',
  },
] as const

export enum DocumentAbility {
  DOC_CTEATE = 'doc_create',
  DOC_READ = 'doc_read',
  DOC_EDIT = 'doc_edit',
  DOC_DELETE = 'doc_delete',
  DOC_JOIN = 'doc_join',
  DOC_SHARE = 'doc_share',
  DOC_COMMENT = 'doc_comment',
}
// 角色选项
export const DocumentCollaboratorRoleOptions = [
  {
    label: "可阅读",
    value: CollaboratorRole.READ,
    tip: "仅拥有只读和评论权限",
  },
  {
    label: "可编辑",
    value: CollaboratorRole.EDIT,
    tip: "拥有文档编辑权限",
  },
  {
    label: "可管理",
    value: CollaboratorRole.ADMIN,
    tip: "拥有文档所有权限权限",
  },
];
export interface DocumentItem {
  id: string;
  userId: string;
  type: DocumentType
  name: string;
  has_collected: boolean;
  view_count: number;
  slug: string;
  is_public: boolean;
  knowledge_id: string;
  content_updated_at: string;
  created_at: string;
  updated_at: string;
}
/** 接口返回的文档树节点（无前端 mode） */
export interface DocumentNodeItem {
  id: string;
  type: DocumentType;
  document_slug: string;
  title: string;
  parent_id?: string | null;
  first_child_id?: string | null;
  document_id: string;
  prev_id?: string | null;
  next_id?: string | null;
  knowledge_id: string;
  created_at: string;
  updated_at: string;
}

/** 前端文档树节点 = 接口节点 + mode */
export interface DocumentNodeTreeItem extends DocumentNodeItem {
  parent_id: string;
  first_child_id: string;
  prev_id: string;
  next_id: string;
  mode: 'preview' | 'edit';
  children?: DocumentNodeTreeItem[];
}

/** 左侧文档树节点的临时 UI 状态（与树结构分离） */
export interface TreeNodeUIState {
  showActions: boolean
  moreOpen: boolean
  addOpen: boolean
  renaming: boolean
}

/** 前端文档树节点的临时 UI 状态（可扩展） */
export type DocumentNodeUIState = Partial<Pick<DocumentNodeTreeItem, 'mode'>>



export interface DragDocumentParams {
  action: 'moveAfter' | 'moveBefore' | 'prependChild',
  node_id: string,
  target_id: string
}