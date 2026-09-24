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
  icon?: AttachmentItem | null
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
