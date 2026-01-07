import request, { type ResponseType } from "../request";
import { documentPrefix } from "../path";
import type { DocumentType, DocumentItem } from "@sk/types";

// 新增文档（需携带知识库id）
export const addDocument = (data: {
  knowledge_id: string;
  type: DocumentType;
  name: string;
}): Promise<ResponseType<string>> => {
  return request.post(`${documentPrefix}/docs`, data);
};

// 通过id或slug获取文档详情
export const getDocumentDetail = (
  identifier: string
): Promise<ResponseType<DocumentItem>> => {
  return request.get(`${documentPrefix}/${identifier}`);
};

// 修改文档
export const updateDocument = (identifier: string, data: Record<string, any>): Promise<ResponseType<DocumentItem>> => {
  return request.put(`${documentPrefix}/${identifier}`, data);
};
// 获取文档内容（这里只是读取内容，不是文档其他信息）

export const getDocumentContent = (documentId: string): Promise<ResponseType<any>> => {
  return request.get(`${documentPrefix}/content/${documentId}`);
};