import { resourceCollaborationPrefix } from '../path'
import request, { type ResponseType } from '../request'
import type {
  ResourceCollaborationItem,
  ResourceCollaborationQuery,
} from '@sk/types'

/** 知识库权限聚合列表（V2） */
export const listKnowledgeCollaborations = (
  knowledgeId: string,
  query?: ResourceCollaborationQuery,
): Promise<ResponseType<ResourceCollaborationItem[]>> => {
  return request.get(
    `${resourceCollaborationPrefix}/knowledge/${knowledgeId}/`,
    { params: query },
  )
}
