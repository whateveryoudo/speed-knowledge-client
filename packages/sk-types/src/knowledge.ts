import type { TeamItem } from './team';
import { CollaboratorRole } from './collaborator';
export interface KnowledgeCreate {
  name: string;
  description?: string;
  cover_url?: any;
  group_id: string;
  icon: string;
  team_id: string;
  space_id: string;
}
export interface KnowledgeItem extends KnowledgeCreate {
  id: string;
  user_id: number;
  team: TeamItem;
  slug: string;
  cover_url: any;
  is_public: boolean;
  items_count: number;
  content_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGroupItem {
  id: string;
  user_id: number;
  group_name: string;
  order_index: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export enum KnowledgeIndexPageLayout {
  CATALOG = "catalog",
  CARD = "card",
  COLUMN = "column",
}
export enum KnowledgeIndexPageSort {
  CATALOG = "catalog",
  CREATE_TIME = "create_time",
  UPDATE_TIME = "update_time",
  LIKE_COUNT = "like_count",
}

// 角色选项
export const KnowledgeCollaboratorRoleOptions = [
  {
    label: "可阅读",
    value: CollaboratorRole.READ,
    tip: "仅拥有只读和评论权限",
  },
  {
    label: "可编辑",
    value: CollaboratorRole.EDIT,
    tip: "拥有文档编辑权限",
  },
  {
    label: "可管理",
    value: CollaboratorRole.ADMIN,
    tip: "拥有知识库所有权限权限",
  },
];
// 首页配置
export const KnowledgeIndexPageLayoutOptions = [
  {
    label: "目录",
    value: KnowledgeIndexPageLayout.CATALOG,
  },
  {
    label: "卡片",
    value: KnowledgeIndexPageLayout.CARD,
  },
  {
    label: "专栏",
    value: KnowledgeIndexPageLayout.COLUMN,
  },
];
export const KnowledgeIndexPageSortOptions = [
  {
    label: "目录",
    value: KnowledgeIndexPageSort.CATALOG,
  },
  {
    label: "创建时间",
    value: KnowledgeIndexPageSort.CREATE_TIME,
  },
  {
    label: "更新时间",
    value: KnowledgeIndexPageSort.UPDATE_TIME,
  },
  {
    label: "点赞次数",
    value: KnowledgeIndexPageSort.LIKE_COUNT,
  },
];

export interface KnowledgeIndexPageResponse extends KnowledgeItem {
  word_count: number;
  enable_catalog: boolean;
  enable_custom_body: boolean;
  enable_user_feed: boolean;
  has_collected: boolean;
  layout: KnowledgeIndexPageLayout;
  sort: KnowledgeIndexPageSort;
}
