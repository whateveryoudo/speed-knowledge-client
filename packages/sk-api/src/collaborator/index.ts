import { collaboratorPrefix, knowledgePrefix } from "../path";
import request, { type ResponseType } from "../request";
import type {
  InvitationResponse,
  InvitationValidInfo,
  CollaboratorResponse,
} from "@sk/types";
import { CollaboratorResourceType } from "@sk/types";

// 获取协作者列表
export const getCollaboratorList = (
  resource_type: CollaboratorResourceType,
  resource_identifier: string,
): Promise<ResponseType<CollaboratorResponse[]>> => {
  return request.get(`${collaboratorPrefix}/${resource_type}/${resource_identifier}/list`);
};


// 获取邀请token信息
export const getInvitationToken = (
  resource_type: CollaboratorResourceType,
  slug: string
): Promise<ResponseType<InvitationResponse>> => {
  return request.get(`${collaboratorPrefix}/${resource_type}/${slug}/invitation/token`);
};
// 重置邀请链接
export const resetInvitationLink = (
  invite_id: string
): Promise<ResponseType<InvitationResponse>> => {
  return request.put(`${collaboratorPrefix}/invitation/${invite_id}/reset`);
};
// 修改邀请配置
export const updateInvitationToken = (
  invite_id: string,
  data: Partial<InvitationResponse>
): Promise<ResponseType<InvitationResponse>> => {
  return request.put(`${collaboratorPrefix}/invitation/token/${invite_id}`, data);
};

// 获取邀请有效链接信息
export const getInvitationValidLinkInfo = (
  token: string
): Promise<ResponseType<InvitationValidInfo>> => {
  return request.get(
    `${collaboratorPrefix}/invitation/valid?invitation_token=${token}`
  );
};

export const applyJoinKnowledge = (data: {
  invitation_token: string;
}): Promise<ResponseType<CollaboratorResponse>> => {
  return request.post(`${collaboratorPrefix}/invitation/apply`, data);
};

export const deleteCollaborator = (
  collaborator_id: string
): Promise<ResponseType<void>> => {
  return request.delete(`${collaboratorPrefix}/collaborator/${collaborator_id}`);
};

export const updateCollaboratorInfo = (
  collaborator_id: string,
  data: Partial<CollaboratorResponse>
): Promise<ResponseType<CollaboratorResponse>> => {
  return request.put(
    `${collaboratorPrefix}/collaborator/${collaborator_id}`,
    data
  );
};

export const auditCollaborator = (
  collaborator_id: string,
  data: { audit_status: "agree" | "reject" }
): Promise<ResponseType<CollaboratorResponse>> => {
  return request.post(
    `${collaboratorPrefix}/${collaborator_id}/audit`,
    data
  );
};
