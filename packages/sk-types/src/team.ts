export enum TeamVisibility {
  PUBLIC = 'public',
  SPACE_MEMBER = 'space_member',
  PRIVATE = 'private',
}

export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface TeamItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  visibility: TeamVisibility | string;
  owner_id: number;
  space_id: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamListItem extends TeamItem {
  member_count: number;
  knowledge_count: number;
  my_role?: TeamMemberRole | null;
  is_joined?: boolean;
}

export interface TeamDetail extends TeamItem {
  member_count: number;
  knowledge_count: number;
  my_role?: TeamMemberRole | null;
}

export interface TeamCreate {
  space_id: string;
  name: string;
  description?: string;
  icon?: string | null;
  visibility: TeamVisibility | string;
  members?: number[];
}

export interface TeamUpdate {
  id: string;
  name?: string;
  description?: string;
  icon?: string | null;
  visibility?: TeamVisibility | string;
}