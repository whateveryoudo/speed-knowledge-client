import request, { type ResponseType } from "../request";
import { documentPrefix, documentNodePrefix } from "../path";
import type {
  DocumentType,
  DocumentItem,
  DragDocumentParams,
  DocumentNodeItem,
} from "@sk/types";
import type { UserInfo, DocumentNodeType } from "@sk/types";
// 新增文档（需携带知识库id）
export const addDocument = (data: {
  knowledge_id: string;
  type: DocumentType;
  name: string;
  parent_id?: string | null;
}): Promise<ResponseType<DocumentNodeItem>> => {
  return request.post(`${documentPrefix}/docs`, data);
};

// 通过id或slug获取文档详情
export const getDocumentDetail = (
  identifier: string,
): Promise<ResponseType<DocumentItem>> => {
  return request.get(`${documentPrefix}/${identifier}`);
};

// 修改文档
export const updateDocument = (
  identifier: string,
  data: Record<string, any>,
): Promise<ResponseType<DocumentItem>> => {
  return request.put(`${documentPrefix}/${identifier}`, data);
};
// 获取文档内容（这里只是读取内容，不是文档其他信息）

export const getDocumentContent = (
  documentId: string,
): Promise<ResponseType<any>> => {
  return request.get(`${documentPrefix}/content/${documentId}`);
};

// 删除文档（旧接口，按 document_id）
export const deleteDocument = (
  documentId: string,
): Promise<ResponseType<any>> => {
  return request.delete(`${documentPrefix}/${documentId}`);
};

// 更新文档节点
export const updateDocumentNode = (
  nodeId: string,
  data: Record<string, any>,
): Promise<ResponseType<any>> => {
  return request.put(`${documentNodePrefix}/${nodeId}`, data);
};
// 删除文档树节点（文档 / 目录统一入口，支持递归删子树）
export const deleteDocumentNode = (
  nodeId: string,
): Promise<ResponseType<any>> => {
  return request.delete(`${documentNodePrefix}/${nodeId}`);
};
// 新建文档节点（这里是主要是目录（其他文档是走的其他接口，后端自己创建的node））
export const createCatalogNode = (data: {
  knowledge_id: string;
  type: DocumentNodeType;
  name: string;
  parent_id: string | null;
}): Promise<ResponseType<DocumentNodeItem>> => {
  return request.post(`${documentNodePrefix}/catalog_nodes`, data);
};
// 拖拽文档
export const dragDocument = (
  data: DragDocumentParams,
): Promise<ResponseType<any>> => {
  return request.put(`${documentNodePrefix}/drag`, data);
};

// 查询当前文档下可访问的用户列表
export const getDocContextUsers = (
  documentId: string,
  keyword?: string,
): Promise<ResponseType<UserInfo[]>> => {
  return request.get(`${documentPrefix}/${documentId}/context-users`, {
    params: { keyword },
  });
};
