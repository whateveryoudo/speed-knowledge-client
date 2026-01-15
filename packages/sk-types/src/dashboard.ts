import { DocumentType } from './document'
export enum DocumentHistoryType {
  EDIT = 'edit',
  VIEW = 'view',
  LIKE = 'like',
  COMMENT = 'comment',
}

export const documentHistoryTypeOptions = [
  {
    label: '编辑过',
    value: DocumentHistoryType.EDIT,
  },
  {
    label: '浏览过',
    value: DocumentHistoryType.VIEW,
  },
  {
    label: '我点赞的',
    value: DocumentHistoryType.LIKE,
  },
  {
    label: '我评论的',
    value: DocumentHistoryType.COMMENT,
  },
]

interface DocumentHistoryBase {
  doc_name: string;
  doc_belong_knowledge_name: string;
  doc_belong_knowledge_slug: string;
  doc_creator: number;
  doc_slug: string;
  doc_type: DocumentType;
  history_type: DocumentHistoryType;
}

export interface DashboardDocumentHistoryQuery extends Partial<DocumentHistoryBase> {
  page: number;
  page_size: number;
}

export interface DashboardDocumentHistoryResponse extends DocumentHistoryBase {
  id: string;
  doc_is_collected: boolean;
  update_datetime: string;
  created_at: string;
  updated_at: string;
}