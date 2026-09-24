/** V2 权限聚合（ResourceGrant） */

export enum PrincipalType {
  USER = 'user',
  SPACE = 'space',
  SPACE_ROLE = 'space_role',
  TEAM_ROLE = 'team_role',
}

export enum PrincipalRole {
  NONE = 'none',
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  READONLY = 'readonly',
  EXTERNAL = 'external',
}

export enum ResourceRole {
  READ = 'read',
  EDIT = 'edit',
  ADMIN = 'admin',
  NONE = 'none',
}

export type CollaborationRowType = 'role_group' | 'pending' | 'user'
export type CollaborationRowStatus = 'pending' | 'effective'

export interface CollaborationUserBrief {
  id: number
  username: string
  nickname?: string | null
  avatar?: string | null
}

export interface ResourceCollaborationQuery {
  keyword?: string
  resource_role?: ResourceRole
}

export interface ResourceCollaborationItem {
  row_type: CollaborationRowType
  principal_type: PrincipalType
  principal_id: string
  principal_role: PrincipalRole
  user?: CollaborationUserBrief | null
  display_name: string
  locked: boolean
  resource_role?: ResourceRole | null
  source?: string | null
  status: CollaborationRowStatus
  can_manage: boolean
  grant_id?: string | null
  access_request_id?: string | null
}

export const ResourceRoleOptions = [
  {
    label: '可阅读',
    value: ResourceRole.READ,
    tip: '仅拥有只读和评论权限',
  },
  {
    label: '可编辑',
    value: ResourceRole.EDIT,
    tip: '拥有文档编辑权限',
  },
  {
    label: '可管理',
    value: ResourceRole.ADMIN,
    tip: '拥有知识库所有权限',
  },
] as const
