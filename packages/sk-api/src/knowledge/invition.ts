import request, { type ResponseType } from "../request";
import { knowledgePrefix } from "../path";
import type {
  KnowledgeInvitationResponse,
  KnowledgeInvitationUpdate,
  KnowledgeInvitationValidInfo,
  KnowledgeCollaboratorResponse,
} from "@sk/types";
// 获取邀请token信息
export const getInvitationToken = (
  slug: string
): Promise<ResponseType<KnowledgeInvitationResponse>> => {
  return request.get(`${knowledgePrefix}/${slug}/invitation/token`);
};
// 重置邀请链接
export const resetInvitationLink = (
  invite_id: string
): Promise<ResponseType<KnowledgeInvitationResponse>> => {
  return request.put(`${knowledgePrefix}/invitation/${invite_id}/reset`);
};
// 修改邀请配置
export const updateInvitationToken = (
  invite_id: string,
  data: Partial<KnowledgeInvitationResponse>
): Promise<ResponseType<KnowledgeInvitationResponse>> => {
  return request.put(`${knowledgePrefix}/invitation/token/${invite_id}`, data);
};

// 获取邀请有效链接信息
export const getInvitationValidLinkInfo = (
  token: string
): Promise<ResponseType<KnowledgeInvitationValidInfo>> => {
  return request.get(
    `${knowledgePrefix}/invitation/valid?invitation_token=${token}`
  );
};

export const applyJoinKnowledge = (data: {
  invitation_token: string;
}): Promise<ResponseType<KnowledgeCollaboratorResponse>> => {
  return request.post(`${knowledgePrefix}/invitation/apply`, data);
};

export const deleteCollaborator = (
  collaborator_id: string
): Promise<ResponseType<void>> => {
  return request.delete(`${knowledgePrefix}/collaborator/${collaborator_id}`);
};

export const updateCollaboratorInfo = (
  collaborator_id: string,
  data: Partial<KnowledgeCollaboratorResponse>
): Promise<ResponseType<KnowledgeCollaboratorResponse>> => {
  return request.put(
    `${knowledgePrefix}/collaborator/${collaborator_id}`,
    data
  );
};

export const auditCollaborator = (
  collaborator_id: string,
  data: { audit_status: "agree" | "reject" }
): Promise<ResponseType<KnowledgeCollaboratorResponse>> => {
  return request.post(
    `${knowledgePrefix}/collaborator/${collaborator_id}/audit`,
    data
  );
};
