import request, { type ResponseType } from '../request'
import { spacePrefix } from '../path'
import type { SpaceCreate, SpaceItem } from '@sk/types'

export const getSpaceInfo = (): Promise<ResponseType<SpaceItem | null>> => {
  return request.get(`${spacePrefix}/`)
}

export const getSpaceInfoByDomin = (
  space_domin: string,
): Promise<ResponseType<SpaceItem>> => {
  return request.get(`${spacePrefix}/by_domin/${space_domin}`)
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
  domin: string,
): Promise<ResponseType<boolean>> => {
  return request.get(`${spacePrefix}/check-domin-available`, {
    params: { domin },
  })
}
