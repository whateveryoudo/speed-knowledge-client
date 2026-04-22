import request, { type ResponseType } from "../request";
import { knowledgePrefix } from "../path";
import type {
  KnowledgeItem,
  KnowledgeGroupItem,
  KnowledgeCreate,
  DocumentNodeTreeItem,
  KnowledgeIndexPageResponse
} from "@sk/types";

// 获取知识库列表（不分页）
export const getUnreadCount = (): Promise<ResponseType<number>> => {
  return request.get(`${notificationPrefix}/unread-count`);
};
// 获取某个分类下的消息列表（不传入bizType则获取全部消息）
export const getNotificationList = (bizType: string): Promise<
  ResponseType<NotificationItem[]>
> => {
  return request.get(`${notificationPrefix}/list`, { params: { bizType } });
};

// 标记已读（单条）
export const changeReadStatus = (id: string): Promise<ResponseType<boolean>> => {
  return request.post(`${notificationPrefix}/change-read-status`, { id });
};

// 标记已读（当前分类下全部，不传入bizType则标记全部已读）
export const changeAllReadStatus = (bizType: string): Promise<ResponseType<boolean>> => {
  return request.post(`${notificationPrefix}/change-all-read-status`, { bizType });
};