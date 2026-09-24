import dayjs from "dayjs";
import type {
  DocumentRouteContext,
  KnowledgeRouteContext,
  KnowledgeItem,
} from "@sk/types";

const IPV4_HOST_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/** 从 Host 解析空间子域名；localhost / IP / 裸域名 返回空字符串 */
export const getSpaceSubdomain = (hostname: string): string => {
  const host = hostname.split(":")[0]?.toLowerCase() ?? "";
  if (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    IPV4_HOST_RE.test(host)
  ) {
    return "";
  }
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] && parts[0] !== "www") {
    return parts[0];
  }
  return "";
};

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

/** 知识库路由第一段：优先 scope_slug，其次 team.slug，个人库可回退 username */
export const resolveKnowledgeScopeSlug = (
  book: Pick<KnowledgeItem, "scope_slug" | "team_id" | "team">,
  fallbackUsername?: string,
): string => {
  if (book.scope_slug) return book.scope_slug;
  if (book.team_id && book.team?.slug) return book.team.slug;
  if (fallbackUsername) return fallbackUsername;
  return book.team?.slug || "";
};

const resolveScopeFromRouteContext = (
  routeContext: KnowledgeRouteContext | DocumentRouteContext,
) => {
  return routeContext.scope_slug || routeContext.team_slug || "";
};

// 构建文档跳转路由URL
export const buildDocumentRouterUrl = (routeContext: DocumentRouteContext) => {
  const scope = resolveScopeFromRouteContext(routeContext);
  const suffix = `/knowledge/${routeContext.knowledge_slug}/document/${routeContext.document_slug}`;
  return routeContext.space_domain
    ? `${routeContext.space_domain}/${scope}${suffix}`
    : `/${scope}${suffix}`;
};

// 构建知识库跳转路由URL
export const buildKnowledgeRouterUrl = (
  routeContext: KnowledgeRouteContext,
) => {
  const scope = resolveScopeFromRouteContext(routeContext);
  const suffix = `/knowledge/${routeContext.knowledge_slug}`;
  return routeContext.space_domain
    ? `${routeContext.space_domain}/${scope}${suffix}`
    : `/${scope}${suffix}`;
};
