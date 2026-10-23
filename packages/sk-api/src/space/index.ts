import request, { type ResponseType } from '../request'
import { spacePrefix, spaceDepartmentPrefix, spaceMemberPrefix } from '../path'
import type {
  SpaceCreate,
  SpaceItem,
  KnowledgeGroupItem,
  SpaceDepartmentItem,
  SpaceDepartmentCreate,
  SpaceDepartmentUpdate,
  SpaceMemberListItem,
  SpaceMemberQuery,
  SpaceMemberExtra,
} from '@sk/types'
import { SpaceMemberRole } from '@sk/types'

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

// ==================== 部门管理 API ====================

/** 获取空间全量部门树 */
export const getDepartmentTree = (): Promise<ResponseType<SpaceDepartmentItem[]>> => {
  return request.get(`${spaceDepartmentPrefix}/tree`)
}

/** 获取空间部门树（懒加载） */
export const getDepartmentLazyTree = (
  parent_id?: string | null,
): Promise<ResponseType<SpaceDepartmentItem[]>> => {
  return request.get(`${spaceDepartmentPrefix}/tree/lazy`, {
    params: parent_id ? { parent_id } : undefined,
  })
}

/** 新建部门 */
export const createDepartment = (
  data: SpaceDepartmentCreate,
): Promise<ResponseType<SpaceDepartmentItem>> => {
  return request.post(`${spaceDepartmentPrefix}/`, data)
}

/** 修改部门 */
export const updateDepartment = (
  deptId: string,
  data: SpaceDepartmentUpdate,
): Promise<ResponseType<SpaceDepartmentItem>> => {
  return request.put(`${spaceDepartmentPrefix}/${deptId}`, data)
}

/** 删除部门 */
export const deleteDepartment = (
  deptId: string,
): Promise<ResponseType<boolean>> => {
  return request.delete(`${spaceDepartmentPrefix}/${deptId}`)
}

// ==================== 空间成员 API ====================

export interface SpaceMemberListResult {
  items: SpaceMemberListItem[]
  total: number
  has_more: boolean
  page: number
  page_size: number
  extra?: SpaceMemberExtra
}

/** 分页查询空间成员列表 */
export const listSpaceMembers = (
  params?: SpaceMemberQuery,
): Promise<ResponseType<SpaceMemberListResult>> => {
  return request.get(`${spaceMemberPrefix}/`, { params })
}

/** 添加或恢复空间成员 */
export const addSpaceMember = (data: {
  user_id: number
  department_ids: string[]
  role: SpaceMemberRole
}): Promise<ResponseType<any>> => {
  return request.post(`${spaceMemberPrefix}/`, data)
}

/** 操作成员离职 */
export const operateMemberResigned = (
  memberId: string,
): Promise<ResponseType<boolean>> => {
  return request.post(`${spaceMemberPrefix}/${memberId}/resigned`)
}

/** 修改成员角色 */
export const updateMemberRole = (
  memberId: string,
  role: SpaceMemberRole,
): Promise<ResponseType<any>> => {
  return request.put(`${spaceMemberPrefix}/${memberId}/role`, { role })
}

/** 调整成员所属部门 */
export const adjustMemberDepartments = (
  memberId: string,
  department_ids: string[],
): Promise<ResponseType<boolean>> => {
  return request.put(`${spaceMemberPrefix}/${memberId}/departments`, {
    department_ids,
  })
}

/** 批量物理删除已离职成员 */
export const batchDeleteResignedMembers = (
  member_ids: string[],
): Promise<ResponseType<boolean>> => {
  return request.post(`${spaceMemberPrefix}/batch-delete`, { member_ids })
}

