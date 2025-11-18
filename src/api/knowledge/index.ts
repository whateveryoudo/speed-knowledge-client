import request, { type ResponseType } from '../request'
import { knowledgePrefix } from '../path'
export interface KnowledgeItem {
    id: string
    user_id: number
    group_id: number
    icon: string
    name: string
    slug: string
    description: string
    cover_url: string
    is_public: boolean
    items_count: number
    content_updated_at: string
    created_at: string
    updated_at: string
}
// 获取知识库列表（不分页）
export const getKnowledgeList = (): Promise<ResponseType<KnowledgeItem[]>> => {
  return request.get(`${knowledgePrefix}/list`)
}
