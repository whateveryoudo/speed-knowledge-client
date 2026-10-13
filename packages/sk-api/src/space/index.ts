import request, { type ResponseType } from '../request'
import { spacePrefix } from '../path'
import type { SpaceCreate, SpaceItem, KnowledgeGroupItem } from '@sk/types'

export const getSpaceInfo = (): Promise<ResponseType<SpaceItem | null>> => {
  return request.get(`${spacePrefix}/`)
}

/** 校验当前用户是否可访问当前空间（组织子域需为成员）；403 时 silent，由 layout 展示无权页 */
export const checkSpaceAccess = (): Promise<ResponseType<SpaceItem>> => {
  return request.get(`${spacePrefix}/current/access`, {
    headers: { silent: true },
  })
}

export const getSpaceInfoByDomain = (
  space_domain: string,
): Promise<ResponseType<SpaceItem>> => {
  return request.get(`${spacePrefix}/by_domain/${space_domain}`)
}

export const listSpaces = (): Promise<ResponseType<SpaceItem[]>> => {
  return request.get(`${spacePrefix}/list`)
}

export const createSpace = (
  data: SpaceCreate,
): Promise<ResponseType<SpaceItem>> => {
  return request.post(`${spacePrefix}/`, data)
}

export const checkDomainAvailable = (
  domain: string,
): Promise<ResponseType<boolean>> => {
  return request.get(`${spacePrefix}/check-domain-available`, {
    params: { domain },
  })
}

/** 获取空间公共区带知识库的分组列表 */
export const getSpaceKnowledgeGroups = (
  keyword?: string,
): Promise<ResponseType<KnowledgeGroupItem[]>> => {
  return request.get(`${spacePrefix}/groups`, {
    params: keyword ? { keyword } : undefined,
  })
}

/** 空间公共区创建分组 */
export const createSpaceKnowledgeGroup = (): Promise<
  ResponseType<KnowledgeGroupItem>
> => {
  return request.post(`${spacePrefix}/groups/create`)
}
