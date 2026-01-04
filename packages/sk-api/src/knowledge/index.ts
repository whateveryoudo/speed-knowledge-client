import request, { type ResponseType } from "../request";
import { knowledgePrefix } from "../path";
import type {
  KnowledgeItem,
  KnowledgeGroupItem,
  KnowledgeCreate,
  DocumentNodeTreeItem,
  KnowledgeCollaboratorResponse
} from "@sk/types";

// 获取知识库列表（不分页）
export const getKnowledgeList = (): Promise<ResponseType<KnowledgeItem[]>> => {
  return request.get(`${knowledgePrefix}/list`);
};
// 获取分组列表
export const getKnowledgeGroupList = (): Promise<
  ResponseType<KnowledgeGroupItem[]>
> => {
  return request.get(`${knowledgePrefix}/group/list`);
};

// 新增知识库
export const addKnowledge = (
  data: KnowledgeCreate
): Promise<ResponseType<string>> => {
  return request.post(`${knowledgePrefix}/`, data);
};
// 删除知识库
export const deleteKnowledge = (
  id: string
): Promise<ResponseType<KnowledgeItem>> => {
  return request.delete(`${knowledgePrefix}/${id}`);
};
// 修改知识库
export const updateKnowledge = (
  data: KnowledgeItem
): Promise<ResponseType<KnowledgeItem>> => {
  return request.put(`${knowledgePrefix}/update`, data);
};
// 通过短链/id获取知识库详情
export const getKnowledgeDetail = (
  identifier: string
): Promise<ResponseType<KnowledgeItem>> => {
  return request.get(`${knowledgePrefix}/${identifier}`);
};

// 通过知识库id查询文档节点树
export const getDocumentNodesTreeById = (
  knowledge_id: string
): Promise<ResponseType<DocumentNodeTreeItem[]>> => {
  return request.get(`${knowledgePrefix}/${knowledge_id}/document/tree`);
};

export const getCollaboratorList = (
  knowledge_id: string
): Promise<ResponseType<KnowledgeCollaboratorResponse[]>> => {
  return request.get(`${knowledgePrefix}/${knowledge_id}/collaborator/list`);
};