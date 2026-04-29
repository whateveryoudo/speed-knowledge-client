import request, { type ResponseType } from "../request";
import { notificationPrefix } from "../path";

import type {
  NotificationItem,
  NotificationListType,
  ReadUnreadType,
  NotificationUnreadCountMap,
} from "@sk/types";

// 获取所有未读消息数量（所有分类）
export const getAllUnreadCount = (): Promise<
  ResponseType<NotificationUnreadCountMap>
> => {
  return request.get(`${notificationPrefix}/all-unread-count`);
};
// 获取某个分类下的未读消息数量
export const getUnreadCountByListType = (
  listType: NotificationListType | '',
): Promise<ResponseType<number>> => {
  return request.get(`${notificationPrefix}/unread-count`, {
    params: { listType },
  });
};
// 获取某个分类下的消息列表（不传入bizType则获取全部消息）
export const getNotificationList = (params: {
  listType: NotificationListType;
  type: ReadUnreadType;
}): Promise<ResponseType<NotificationItem[]>> => {
  return request.get(`${notificationPrefix}/list`, { params });
};

// 标记已读（单条）
export const changeReadStatus = (
  notificationId: string,
): Promise<ResponseType<boolean>> => {
  return request.put(`${notificationPrefix}/${notificationId}/read`);
};

// 标记已读（当前分类下全部，不传入bizType则标记全部已读）
export const changeAllReadStatus = (
  bizType: string,
): Promise<ResponseType<boolean>> => {
  return request.post(`${notificationPrefix}/change-all-read-status`, {
    bizType,
  });
};
