import type { AttachmentItem } from './common';
export enum SpaceMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}
export interface SpaceMemberItem {
  id: string;
  user_id: string;
  space_id: string;
  role: SpaceMemberRole;
  created_at: string;
  updated_at: string;
}
export enum SpaceType {
  PERSONAL = 'personal',
  TEAM = 'team',
}
export interface SpaceItem {
  id: string;
  type: SpaceType;
  name: string;
  domain: string;
  owner_id: string;
  contact_email: string;
  icon: AttachmentItem;
  description: string;
  created_at: string;
  updated_at: string;
  space_members: SpaceMemberItem[];
}