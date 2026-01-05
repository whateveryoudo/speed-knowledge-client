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
  REVOKED = 2,
}
export enum KnowledgeCollaboratorRole {
  READ = 1,
  EDIT = 2,
  ADMIN = 3,
}
// 角色选项
export const KnowledgeCollaboratorRoleOptions = [
  {
    label: "可阅读",
    value: KnowledgeCollaboratorRole.READ,
    tip: '仅拥有只读和评论权限'
  },
  {
    label: "可编辑",
    value: KnowledgeCollaboratorRole.EDIT,
    tip: '拥有文档编辑权限'
  },
  {
    label: "可管理",
    value: KnowledgeCollaboratorRole.ADMIN,
    tip: '拥有知识库所有权限权限'
  },
];
export enum KnowledgeCollaboratorStatus {
  PENDING = 1,
  ACCEPTED = 2,
}
export enum KnowledgeCollaboratorSource {
  CREATOR = 0,
  INVITATION = 1,
  SEARCH_JOIN = 2,
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

export interface KnowledgeCollaboratorResponse {
  id: string;
  user_id: number;
  knowledge_id: string;
  role: KnowledgeCollaboratorRole;
  status: KnowledgeCollaboratorStatus;
  source: KnowledgeCollaboratorSource;
  created_at: string;
  updated_at: string;
}
// 邀请校验信息（用于邀请链接的一些显示）
export interface KnowledgeInvitationValidInfo {
  invitation: {
    status: KnowledgeInvitationStatus;
    knowledge_name: string;
    knowledge_id: string;
  };
  collaborator: null | {
    status: KnowledgeCollaboratorStatus;
  };
}
