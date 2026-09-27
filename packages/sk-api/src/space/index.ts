import request, { type ResponseType } from '../request'
import { spacePrefix } from '../path'
import type { SpaceCreate, SpaceItem } from '@sk/types'

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
