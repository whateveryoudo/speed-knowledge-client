export enum OrgType {
  SPACE = 'space',
  TEAM = 'team',
}

export enum OrgInvitationUserStatus {
  NOT_JOINED = 'not_joined',
  JOINED = 'joined',
  PENDING = 'pending',
  EXTERNAL = 'external',
}

export interface OrgInvitationUpdateSettings {
  need_approval?: boolean | null
  default_dept_id?: string | null
  default_role?: string | null
}

export interface OrgInvitationResponse {
  id: string
  org_type: OrgType
  org_id: string
  token: string
  need_approval: boolean
  default_dept_id?: string | null
  default_role: string
  status: string
  created_at: string
}

export interface OrgInvitationPublicInfo {
  org_id: string
  org_type: OrgType
  org_icon?: string | null
  org_name?: string | null
  inviter_name?: string | null
  need_approval: boolean
  default_dept_id?: string | null
  default_dept_name?: string | null
  user_status: OrgInvitationUserStatus
  org_slug?: string | null
}

export interface OrgInvitationAcceptResponse {
  user_status: OrgInvitationUserStatus
  org_id: string
  org_slug?: string | null
}

