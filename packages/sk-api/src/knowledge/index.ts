import request, {
  type ResponseType,
  type PaginationResponse,
} from "../request";
import { knowledgePrefix } from "../path";
import type {
  KnowledgeItem,
  KnowledgeGroupItem,
  KnowledgeGroupUpdateBody,
  KnowledgeGroupRelationMoveBody,
  KnowledgeCreate,
  DocumentNodeItem,
  DocumentNodeTreeItem,
  KnowledgeIndexPageResponse,
  KnowledgeCommonPinItem,
  KnowledgeListQuery,
} from "@sk/types";

/** 分页获取知识库列表（个人 / 协作） */
export const getKnowledgeListPage = (
  data: KnowledgeListQuery
): Promise<ResponseType<PaginationResponse<KnowledgeItem>>> => {
  return request.post(`${knowledgePrefix}/list`, data);
};
// 获取分组列表
export const getKnowledgeGroupList = (): Promise<
  ResponseType<KnowledgeGroupItem[]>
> => {
  return request.get(`${knowledgePrefix}/group/list`);
};

// 获取带知识库的分组列表
export const getKnowledgeGroupListDetail = (
  keyword?: string
): Promise<ResponseType<KnowledgeGroupItem[]>> => {
  return request.get(`${knowledgePrefix}/group/list-detail`, {
    params: keyword ? { keyword } : undefined,
  });
};

// 创建分组
export const createKnowledgeGroup = (): Promise<ResponseType<KnowledgeGroupItem>> => {
  return request.post(`${knowledgePrefix}/group/create`);
};

// 更新分组
export const updateKnowledgeGroup = (
  groupId: string,
  data: KnowledgeGroupUpdateBody
): Promise<ResponseType<null>> => {
  return request.put(`${knowledgePrefix}/group/update/${groupId}`, data);
};

// 更新分组排序
export const updateKnowledgeGroupOrder = (
  groupId: string,
  orderIndex: number
): Promise<ResponseType<null>> => {
  return request.put(`${knowledgePrefix}/group/order/${groupId}`, null, {
    params: { order_index: orderIndex },
  });
};

// 删除分组
export const deleteKnowledgeGroup = (
  groupId: string
): Promise<ResponseType<null>> => {
  return request.delete(`${knowledgePrefix}/group/${groupId}`);
};

// 移动/排序分组内知识库
export const moveKnowledgeGroupRelation = (
  knowledgeId: string,
  data: KnowledgeGroupRelationMoveBody
): Promise<ResponseType<null>> => {
  return request.put(`${knowledgePrefix}/group/relation/${knowledgeId}`, data);
};

// 新增知识库
export const addKnowledge = (
  data: KnowledgeCreate
): Promise<ResponseType<string>> => {
  return request.post(`${knowledgePrefix}/`, data);
};

// 修改知识库
export const updateKnowledge = (
  data: KnowledgeItem
): Promise<ResponseType<KnowledgeItem>> => {
  return request.put(`${knowledgePrefix}/update`, data);
};
// 通过短链/id获取知识库详情(silent: 是否静默)
export const getKnowledgeDetail = (
  identifier: string,
  silent: boolean = false
): Promise<ResponseType<KnowledgeItem>> => {
  return request.get(`${knowledgePrefix}/${identifier}`, { headers: { silent } });
};

// 通过知识库id查询文档节点树
export const getDocumentNodesTreeById = (
  knowledge_id: string
): Promise<ResponseType<DocumentNodeItem[]>> => {
  return request.get(`${knowledgePrefix}/${knowledge_id}/document/tree`);
};

// 删除知识库
export const deleteKnowledge = (
  slug: string
): Promise<ResponseType<Boolean>> => {
  return request.delete(`${knowledgePrefix}/${slug}`);
};



// 获取知识库首页信息
export const getKnowledgeIndexPage = (
  identifier: string
): Promise<ResponseType<KnowledgeIndexPageResponse>> => {
  return request.get(`${knowledgePrefix}/${identifier}/index-page`);
};

// 常用知识库 pin 列表
export const getCommonPinList = (): Promise<
  ResponseType<KnowledgeCommonPinItem[]>
> => {
  return request.get(`${knowledgePrefix}/common-pin/list`);
};

// 设为常用
export const createCommonPin = (
  knowledge_id: string
): Promise<ResponseType<KnowledgeCommonPinItem>> => {
  return request.post(`${knowledgePrefix}/common-pin/create`, null, {
    params: { knowledge_id },
  });
};

// 更新常用排序（拖拽目标位置）
export const updateCommonPinOrder = (
  knowledge_id: string,
  order_index: number
): Promise<ResponseType<null>> => {
  return request.put(
    `${knowledgePrefix}/common-pin/update/${knowledge_id}`,
    null,
    { params: { order_index } }
  );
};

// 取消常用
export const deleteCommonPin = (
  knowledge_id: string
): Promise<ResponseType<null>> => {
  return request.delete(`${knowledgePrefix}/common-pin/${knowledge_id}`);
};