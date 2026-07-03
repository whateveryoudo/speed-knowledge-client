export enum SearchContextType {
  GLOBAL = 'global',
  KNOWLEDGE = 'knowledge',
}

export enum SearchVisibilityType {
  RELATED = 'related',
  PUBLIC = 'public',
}

export interface SearchQuery {
  context: SearchContextType
  visibility: SearchVisibilityType
  keyword: string
  knowledge_id?: string
}

export interface SearchKnowledgeItem {
  id: string
  name: string
  slug: string
  team_slug?: string | null
  is_public: boolean
}

export interface SearchDocumentItem {
  id: string
  name: string
  slug: string
  knowledge_id: string
  knowledge_name: string
  knowledge_slug: string
  team_slug?: string | null
}

export interface SearchSection {
  type: 'knowledge' | 'document'
  items: Array<SearchKnowledgeItem | SearchDocumentItem>
}

export interface SearchResponse {
  sections: SearchSection[]
}
