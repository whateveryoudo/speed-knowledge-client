import request, { type ResponseType } from '../request'
import { knowledgePrefix } from '../path'
import { KnowledgeItem, KnowledgeGroupItem } from '@sk/types'

// 获取知识库列表（不分页）
export const getKnowledgeList = (): Promise<ResponseType<KnowledgeItem[]>> => {
  console.log(request);
  return request.get(`${knowledgePrefix}/list`)
}
// 获取分组列表
export const getKnowledgeGroupList = (): Promise<ResponseType<KnowledgeGroupItem[]>> => {
  return request.get(`${knowledgePrefix}/group/list`)
}
