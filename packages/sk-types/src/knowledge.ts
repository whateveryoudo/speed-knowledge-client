import type { TeamItem } from './team';
import { CollaboratorRole } from './collaborator';
import type { Ability } from './index';
export interface KnowledgeCreate {
  name: string;
  description?: string;
  cover_url?: any;
  group_id: string;
  icon: string;
  team_id: string;
  space_id: string;
}
/** 知识库列表 scope，与后端 KnowledgeFromWay 一致 */
export enum KnowledgeFromWay {
  OWN = 'own',
  COLLABORATION = 'collaboration',
}

export enum ListSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface KnowledgeListSortRule {
  field: string;
  order: ListSortOrder;
}

export interface KnowledgeListQuery {
  scope?: KnowledgeFromWay;
  keyword?: string;
  sorts?: KnowledgeListSortRule[];
  page: number;
  page_size: number;
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
  source?: KnowledgeFromWay;
  collaborator_id?: string | null;
  ability?: Record<Ability, boolean>;
}

export interface KnowledgeCommonPinItem {
  id: string;
  knowledge_id: string;
  user_id: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  knowledge: KnowledgeItem;
}

export enum KnowledgeAbility {
  CREATE_BOOK = 'create_book', // 创建知识库(这个权限不应该出现在这层，先定死吧，目前只有个人空间)
  DELETE_BOOK = 'delete_book',
  CREATE_BOOK_COLLABORATOR = 'create_book_collaborator',
  EXPORT_BOOK = 'export_book',
  MODIFY_BOOK_SETTING = 'modify_book_setting',
  SHARE_BOOK = 'share_book',
  MODIFY_BOOK_PERMISSION = 'modify_book_permission',
}
export enum KnowledgeGroupType {
  CARD = 'card',
  LIST = 'list',
}

export enum KnowledgeGroupStyle {
  SIMPLE = 'simple',
  BASIC = 'basic',
  DETAIL = 'detail',
  IMAGE = 'image',
}

export interface KnowledgeGroupDisplayConfig {
  type: KnowledgeGroupType;
  style: KnowledgeGroupStyle;
  show_knowledge_icon?: boolean;
  show_knowledge_description?: boolean;
  doc_order_type?: number;
}

export const DEFAULT_GROUP_DISPLAY_CONFIG: KnowledgeGroupDisplayConfig = {
  type: KnowledgeGroupType.CARD,
  style: KnowledgeGroupStyle.DETAIL,
  show_knowledge_icon: true,
  show_knowledge_description: true,
  doc_order_type: 1,
};

export interface KnowledgeGroupUpdateBody {
  group_name?: string;
  order_index?: number;
  display_config?: KnowledgeGroupDisplayConfig;
}

export interface KnowledgeGroupRelationMoveBody {
  group_id: string;
  order_index: number;
}

export interface KnowledgeGroupItem {
  id: string;
  user_id: number;
  group_name: string;
  order_index: number;
  is_default: boolean;
  display_config?: KnowledgeGroupDisplayConfig;
  created_at: string;
  updated_at: string;
  knowledge_items?: KnowledgeItem[];
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
