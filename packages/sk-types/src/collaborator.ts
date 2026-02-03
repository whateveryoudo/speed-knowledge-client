import type { UserInfo } from "./user";
// 邀请状态 1: 有效 2: 失效
export enum InvitationStatus {
    ACTIVE = 1,
    REVOKED = 2,
}
// 协作者角色 1: 只读 2: 编辑 3: 管理
export enum CollaboratorRole {
    READ = 1,
    EDIT = 2,
    ADMIN = 3,
}
// 协作者状态 1: 待审核 2: 已通过
export enum CollaboratorStatus {
    PENDING = 1,
    ACCEPTED = 2,
}
// 协作者来源 0: 创建者 1: 邀请 2: 搜索加入
export enum CollaboratorSource {
    CREATOR = 0,
    INVITATION = 1,
    SEARCH_JOIN = 2,
}
export enum CollaboratorResourceType {
    KNOWLEDGE = "knowledge",
    DOCUMENT = "document",
}
// 邀请基础信息
export interface InvitationBase {
    knowledge_id?: string;
    document_id?: string;
    token: string;
    status: InvitationStatus;
    role: CollaboratorRole;
    need_approval: 0 | 1;
}
// 邀请响应信息
export interface InvitationResponse extends InvitationBase {
    id: string;
    created_at: string;
    updated_at: string;
}
// 协作者响应信息
export interface CollaboratorResponse {
    id: string;
    user_id: number;
    knowledge_id: string;
    knowledge_slug: string;
    document_slug?: string;
    document_id?: string;
    document_name?: string;
    target_type: CollaboratorResourceType;
    role: CollaboratorRole;
    user: UserInfo;
    status: CollaboratorStatus;
    source: CollaboratorSource;
    created_at: string;
    updated_at: string;
}
// 邀请校验信息（用于邀请链接页面的一些显示）
export interface InvitationValidInfo {
    invitation: {
        status: InvitationStatus;
        knowledge_name?: string;
        knowledge_id?: string;
        document_name?: string;
        document_id?: string;
        role: CollaboratorRole;
        invitate_type: CollaboratorResourceType;
        need_approval: 0 | 1;
    };
    collaborator: null | {
        status: CollaboratorStatus;
    };
}