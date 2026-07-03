import request, { type ResponseType } from '../request'
import { resourcePrefix } from '../path'
import type {
  CollaboratorResourceType,
  ResourceAccessCreate,
  ResourceAccessItem,
  ResourceAccessUpdate,
} from '@sk/types'

export const getResourceAccessByTarget = (
  targetType: CollaboratorResourceType,
  targetId: string,
): Promise<ResponseType<ResourceAccessItem | null>> => {
  return request.get(`${resourcePrefix}/get-by-target/${targetType}/${targetId}`, {
    headers: { silent: true },
  })
}

export const createResourceAccess = (
  data: ResourceAccessCreate,
): Promise<ResponseType<ResourceAccessItem>> => {
  return request.post(`${resourcePrefix}/`, data)
}

export const updateResourceAccess = (
  id: string,
  data: ResourceAccessUpdate,
): Promise<ResponseType<ResourceAccessItem>> => {
  return request.put(`${resourcePrefix}/${id}`, data)
}

export const deleteResourceAccess = (id: string): Promise<ResponseType<boolean>> => {
  return request.delete(`${resourcePrefix}/${id}`)
}
