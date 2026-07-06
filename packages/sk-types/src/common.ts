import type { DocumentType } from './document'

export enum CollectResourceType {
  KNOWLEDGE = "knowledge",
  DOCUMENT = "document",
}

export const collectResourceTypeOptions = [
  { label: '所有收藏', value: '' },
  { label: '知识库', value: CollectResourceType.KNOWLEDGE },
  { label: '文档', value: CollectResourceType.DOCUMENT },
]

export interface CollectTeamBrief {
  name: string
  slug: string
}

export interface CollectKnowledgeBrief {
  id: string
  name: string
  slug: string
  icon: string
}

export interface CollectDocumentBrief {
  id: string
  name: string
  slug: string
  type: DocumentType
}

export interface CollectListItem {
  id: string
  resource_type: CollectResourceType
  identifier: string
  created_at: string
  team: CollectTeamBrief
  knowledge: CollectKnowledgeBrief
  document?: CollectDocumentBrief | null
}

export interface CollectListQuery {
  resource_type?: CollectResourceType
  keyword?: string
}
