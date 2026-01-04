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
  data: KnowledgeInvitationUpdate
): Promise<ResponseType<KnowledgeInvitationResponse>> => {
  return request.put(`${knowledgePrefix}/invitation/token`, data);
};

// 获取邀请有效链接信息
export const getInvitationValidLinkInfo = (
  token: string
): Promise<ResponseType<KnowledgeInvitationValidInfo>> => {
  return request.get(`${knowledgePrefix}/invitation/valid?invitation_token=${token}`);
};

export const applyJoinKnowledge = (
  data: {invitation_token: string}
): Promise<ResponseType<KnowledgeCollaboratorResponse>> => {
  return request.post(`${knowledgePrefix}/invitation/apply`, data);
};
