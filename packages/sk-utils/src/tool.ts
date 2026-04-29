import dayjs from "dayjs";
import type { DocumentRouteContext, KnowledgeRouteContext } from "@sk/types";
export const transformDatatimeToRecentText = (datetime: Date | string) => {
  const diffMinutes = dayjs().diff(dayjs(datetime), "minutes");
  const now = dayjs();
  const target = dayjs(datetime);
  const isToday = now.isSame(target, "day");
  const isYesterday = now.subtract(1, "day").isSame(target, "day");

  if (!isToday && !isYesterday) {
    return target.format("YYYY-MM-DD HH:mm:ss");
  }
  if (isToday) {
    if (diffMinutes < 60) {
      return diffMinutes < 1 ? "刚刚" : `${diffMinutes}分钟前`;
    }
    return "今天 " + target.format("HH:mm:ss");
  }
  if (isYesterday) {
    return "昨天 " + target.format("HH:mm:ss");
  }
};

// 构建文档跳转路由URL
export const buildDocumentRouterUrl = (routeContext: DocumentRouteContext) => {
  const suffix = `/knowledge/${routeContext.knowledge_slug}/document/${routeContext.document_slug}`;
  return routeContext.space_domain
    ? `${routeContext.space_domain}/${routeContext.team_slug}${suffix}`
    : `/${routeContext.team_slug}${suffix}`;
};

// 构建知识库跳转路由URL
export const buildKnowledgeRouterUrl = (
  routeContext: KnowledgeRouteContext,
) => {
  const suffix = `/knowledge/${routeContext.knowledge_slug}`;
  return routeContext.space_domain
    ? `${routeContext.space_domain}/${routeContext.team_slug}${suffix}`
    : `/${routeContext.team_slug}${suffix}`;
};
