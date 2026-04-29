// 基础路由上下文（到团队层）
interface BaseRouteContext {
  space_domain?: string;
  team_slug: string;
}
// 文档路由上下文
export interface DocumentRouteContext extends BaseRouteContext {
  knowledge_slug: string;
  document_slug: string;
}
// 知识库路由上下文
export interface KnowledgeRouteContext extends BaseRouteContext {
  knowledge_slug: string;
}
