import type { TeamItem } from "./team";
import { CollaboratorRole } from "./collaborator";
import type { Ability } from "./index";

// 通知业务类型(聚类后)
export enum NotificationListType {
  // 提及或评论
  MENTION_OR_COMMENT = "mention_or_comment",
  // 点赞
  LIKE = "like",
  // 提及
  MENTION = "mention",
  // 关注
  FOLLOW = "follow",
  // 待处理
  TODO = "todo",
  // 系统
  SYSTEM = "system",
  // 其他
  OTHER = "other",
}

export enum NotificationBizType {
  MENTION = "mention",
  COMMENT = "comment",
  LIKE = "like",
  INVITE = "invite",
  FOLLOW = "follow",
  SYSTEM = "system",
}

export interface NotificationItem {
  id: string;
  mentioned_user_id: number;
  actor_user_id: number;
  biz_type: NotificationBizType;
  biz_id: string;
  payload: Record<string, any>;
  read_at: string;
  created_at: string;
  updated_at: string;
}

// 通知分类选项
export const NotificationBizTypeOptions = [
  {
    label: "提及",
    value: NotificationListType.MENTION,
  },
  {
    label: "点赞",
    value: NotificationBizType.LIKE,
  },
  {
    label: "关注",
    value: NotificationBizType.FOLLOW,
  },
  {
    label: "待处理",
    value: NotificationListType.TODO,
  },
  {
    label: "系统",
    value: NotificationBizType.SYSTEM,
  },
  {
    label: "其他",
    value: NotificationListType.OTHER,
  },
];

