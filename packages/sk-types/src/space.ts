import type { AttachmentItem } from './common'

export enum SpaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  EXTERNAL = 'external',
}

export interface SpaceMemberItem {
  id: string
  user_id: string
  space_id: string
  role: SpaceMemberRole
  created_at: string
  updated_at: string
}

export enum SpaceType {
  PERSONAL = 'personal',
  ORGANIZATION = 'organization',
}

export interface SpaceItem {
  id: string
  type: SpaceType
  name: string
  domain?: string | null
  owner_id: number | string
  contact_email: string
  icon?: AttachmentItem | string | null
  description?: string | null
  public_area_slug?: string | null
  created_at: string
  updated_at: string
  space_members?: SpaceMemberItem[]
}

export interface SpaceCreate {
  name: string
  domain: string
  contact_email: string
  description?: string
}

export interface SpaceDepartmentItem {
  id: string
  space_id: string
  parent_id?: string | null
  name: string
  sort_order: number
  children?: SpaceDepartmentItem[]
  has_children?: boolean
}

export interface SpaceDepartmentCreate {
  name: string
  parent_id?: string | null
  sort_order?: number
}

export interface SpaceDepartmentUpdate {
  name: string
  parent_id?: string | null
  sort_order?: number
}

export interface SpaceMemberUserBrief {
  id: number
  username: string
  nickname?: string | null
  avatar?: string | null
  mobile?: string | null
}

export interface SpaceMemberListItem {
  id: string
  role: SpaceMemberRole
  user: SpaceMemberUserBrief
  created_at: string
  deleted_at?: string | null
  department_names: string[]
}

export interface SpaceMemberQuery {
  tab?: 'member' | 'external' | 'resigned'
  keyword?: string
  department_id?: string
  is_direct?: boolean
  page?: number
  page_size?: number
}

export interface SpaceMemberExtra {
  active_member_count: number
}

