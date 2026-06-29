import request, { type ResponseType } from "../request";
import { teamPrefix } from "../path";
import type { TeamItem } from "@sk/types";

/** 获取空间下的团队列表（含默认个人团队） */
export const getTeamList = (
  spaceId: string
): Promise<ResponseType<TeamItem[]>> => {
  return request.get(`${teamPrefix}/list`, { params: { space_id: spaceId } });
};
