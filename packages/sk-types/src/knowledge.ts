export interface KnowledgeCreate {
  name: string;
  description?: string;
  cover_url?: any;
  group_id: string;
  icon: string;
}
export interface KnowledgeItem extends KnowledgeCreate {
  id: string;
  user_id: number;
  slug: string;
  cover_url: any;
  is_public: boolean;
  items_count: number;
  content_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGroupItem {
  id: string;
  user_id: number;
  group_name: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
export enum KnowledgeInvitationStatus {
  ACTIVE = 1,
  REVOKED = 2
}
export enum KnowledgeCollaboratorRole {
  READ = 1,
  EDIT = 2,
  ADMIN = 3,
}
export interface KnowledgeInvitationBase {
  knowledge_id: string;
  token: string;
  status: KnowledgeInvitationStatus;
  role: KnowledgeCollaboratorRole;
  need_approval: 0 | 1;
}
export interface KnowledgeInvitationResponse extends KnowledgeInvitationBase {
  id: string;
  created_at: string;
  updated_at: string;
}
export interface KnowledgeInvitationUpdate extends Partial<KnowledgeInvitationBase> {
  id: string;
}