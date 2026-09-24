// 基础路由上下文
interface BaseRouteContext {
  space_id?: string;
  space_domain?: string;
  team_id?: string;
  team_name?: string;
  /** @deprecated 使用 scope_slug */
  team_slug?: string;
  /** 路由第一段：username / public_area_slug / team.slug */
  scope_slug?: string;
}
// 文档路由上下文
export interface DocumentRouteContext extends BaseRouteContext {
  document_id?: string;
  document_name?: string;
  document_slug: string;
  knowledge_id?: string;
  knowledge_name?: string;
  knowledge_slug: string;
}
// 知识库路由上下文
export interface KnowledgeRouteContext extends BaseRouteContext {
  knowledge_id?: string;
  knowledge_name?: string;
  knowledge_slug: string;
}
