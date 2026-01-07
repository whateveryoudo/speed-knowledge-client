// 节点类型：目前只有目录和DOC
export enum DocumentNodeType {
  TITLE = "TITLE",
  DOC = "DOC",
}
export enum DocumentType {
  WORD = "word"
}
export interface DocumentItem {
  id: string;
  userId: string;
  type: DocumentType
  name: string;
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
}

