import request, { type ResponseType } from "../request";
import { teamPrefix } from "../path";
import type {
  TeamItem,
  TeamListItem,
  TeamDetail,
  TeamCreate,
  TeamUpdate,
  KnowledgeGroupItem,
} from "@sk/types";

/** 获取当前用户在当前空间下的团队列表 */
export const getMyTeamList = (): Promise<ResponseType<TeamListItem[]>> => {
  return request.get(`${teamPrefix}/list`);
};

/** 获取空间下的团队列表（旧版兼容） */
export const getTeamList = (
  spaceId?: string
): Promise<ResponseType<TeamListItem[]>> => {
  return request.get(`${teamPrefix}/list`, {
    params: spaceId ? { space_id: spaceId } : undefined,
  });
};

/** 获取团队详情 */
export const getTeamDetail = (
  identifier: string
): Promise<ResponseType<TeamDetail>> => {
  return request.get(`${teamPrefix}/${identifier}`);
};

/** 新建团队 */
export const createTeam = (
  data: TeamCreate
): Promise<ResponseType<TeamItem>> => {
  return request.post(`${teamPrefix}/`, data);
};

/** 更新团队 */
export const updateTeam = (
  teamId: string,
  data: TeamUpdate
): Promise<ResponseType<TeamItem>> => {
  return request.put(`${teamPrefix}/${teamId}`, data);
};

/** 获取团队下的知识库分组列表（含 Top3 文档） */
export const getTeamKnowledgeGroups = (
  identifier: string,
  keyword?: string
): Promise<ResponseType<KnowledgeGroupItem[]>> => {
  return request.get(`${teamPrefix}/${identifier}/groups`, {
    params: keyword ? { keyword } : undefined,
  });
};

/** 获取团队轻量分组列表 */
export const getTeamKnowledgeGroupsSimple = (
  identifier: string
): Promise<ResponseType<KnowledgeGroupItem[]>> => {
  return request.get(`${teamPrefix}/${identifier}/groups/simple`);
};

/** 团队下创建分组 */
export const createTeamKnowledgeGroup = (
  identifier: string
): Promise<ResponseType<KnowledgeGroupItem>> => {
  return request.post(`${teamPrefix}/${identifier}/groups/create`);
};

