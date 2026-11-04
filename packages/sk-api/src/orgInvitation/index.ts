import request, { type ResponseType } from '../request'
import { orgInvitationPrefix, orgJoinRequestPrefix } from '../path'
import type {
  OrgType,
  OrgInvitationResponse,
  OrgInvitationUpdateSettings,
  OrgInvitationPublicInfo,
  OrgInvitationAcceptResponse,
} from '@sk/types'

/**
 * 管理员打开弹窗：获取当前管理员在指定组织下的专属邀请链接（若无则自动初始化）
 */
export const getOrInitMyInvitation = (
  orgType: OrgType | string,
  orgId: string,
  data: OrgInvitationUpdateSettings = {},
): Promise<ResponseType<OrgInvitationResponse>> => {
  return request.post(`${orgInvitationPrefix}/${orgType}/${orgId}/my-invitation`, data)
}

/**
 * 修改邀请配置（默认部门、默认角色、是否需审批）
 */
export const saveInvitationSettings = (
  token: string,
  data: OrgInvitationUpdateSettings,
): Promise<ResponseType<OrgInvitationResponse>> => {
  return request.put(`${orgInvitationPrefix}/${token}/update`, data)
}

/**
 * 重置邀请链接 Token
 */
export const resetInvitationToken = (
  token: string,
): Promise<ResponseType<OrgInvitationResponse>> => {
  return request.put(`${orgInvitationPrefix}/${token}/reset`)
}

/**
 * 访问端：通过 Token 获取邀请展示公开信息
 */
export const getInvitationPublicInfo = (
  token: string,
): Promise<ResponseType<OrgInvitationPublicInfo>> => {
  return request.get(`${orgInvitationPrefix}/info/${token}`)
}

/**
 * 接受/申请加入组织
 */
export const acceptInvitation = (
  token: string,
): Promise<ResponseType<OrgInvitationAcceptResponse>> => {
  return request.post(`${orgInvitationPrefix}/accept/${token}`)
}

/**
 * 组织加入申请审批（同意/拒绝）
 */
export const auditJoinRequest = (
  requestId: string,
  status: 'approved' | 'rejected',
): Promise<ResponseType<boolean>> => {
  return request.post(`${orgJoinRequestPrefix}/${requestId}/audit`, { status })
}

/**
 * 申请人主动取消自己的加入申请
 */
export const cancelJoinRequest = (
  requestId: string,
): Promise<ResponseType<boolean>> => {
  return request.post(`${orgJoinRequestPrefix}/${requestId}/cancel`)
}

