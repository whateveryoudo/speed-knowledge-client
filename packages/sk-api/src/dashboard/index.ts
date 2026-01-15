import request, {
  type ResponseType,
  type PaginationResponse,
} from "../request";
import { dashboardPrefix } from "../path";
import {
  DashboardDocumentHistoryQuery,
  DashboardDocumentHistoryResponse,
} from "@sk/types";
// 首页 编辑/浏览/点赞/评论 历史列表
export const getDocumentHistoryList = (
  data: DashboardDocumentHistoryQuery
): Promise<
  ResponseType<PaginationResponse<DashboardDocumentHistoryResponse>>
> => {
  return request.post(`${dashboardPrefix}/document-history-list`, data);
};
