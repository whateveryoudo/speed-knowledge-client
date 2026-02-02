import { CollaboratorRole } from "./collaborator";
// 节点类型：目前只有目录和DOC
export enum DocumentNodeType {
  TITLE = "TITLE",
  DOC = "DOC",
}
export enum DocumentType {
  WORD = "word"
}

export const documentTypeOptions = [
  {
    label: '文档',
    value: DocumentType.WORD,
    icon: 'icon-document',
  },
] as const

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
export interface DocumentNodeTreeItem {
  id: string;
  type: DocumentType;
  document_slug: string;
  title: string;
  parent_id: string;
  first_child_id: string;
  document_id: string;
  prev_id: string;
  next_id: string;
  knowledge_id: string;
  created_at: string;
  updated_at: string;
  mode: 'preview' | 'edit';
  children?: DocumentNodeTreeItem[];
}



export interface DragDocumentParams {
  action: 'moveAfter' | 'moveBefore' | 'prependChild',
  node_id: string,
  target_id: string
}