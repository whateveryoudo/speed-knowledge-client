import { ref, computed } from 'vue';
import type { ConversationItem } from './types';

/**
 * @description Dify 会话历史/消息列表「加载更多」Hook
 *
 * 后端接口（参考 Dify 文档）：
 * - 方法：GET /deepApi/v1/conversations
 * - Query:
 *   - user: string        用户标识，应用内唯一（这里使用 ChatConfig.userName）
 *   - last_id?: string    当前页最后一条记录的 ID，下一页从该 ID 之后开始
 *   - limit?: number      每次请求条数，默认 20，1~100
 *   - sort_by?: string    排序字段，默认 -updated_at
 *
 * 响应结构（关键字段）：
 * - data: ConversationItem[] 会话列表
 * - has_more: boolean        是否还有更多
 * - limit: number            实际返回条数
 */
export function useLoadMore(options?: {
  /** 认证参数 */
  authParams: {
    apiKey: string;
    userName: string;
    apiBaseUrl: string;
  },
  params?: Record<string, any>;
  useFirstId?: boolean; // 会话历史消息时候使用
  /** 每次请求条数，默认 20 */
  limit?: number;
  /** 排序字段，默认 -updated_at，可选：created_at, -created_at, updated_at, -updated_at */
  sortBy?: string;
}) {

  const pageSize = ref(options?.limit ?? 20);
  const sortBy = ref(options?.sortBy ?? '-updated_at');

  const items = ref<ConversationItem[]>([]);
  const loading = ref(false);
  const moreLoading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const lastId = ref<string | null>(null); // 最后一条记录的 ID
  const firstId = ref<string | null>(null); // 第一条记录的 ID
  const isEmpty = computed(() => !loading.value && !moreLoading.value && items.value.length === 0);

  /**
   * @description 拼接请求 URL
   */
  const buildUrl = (extraParams?: Record<string, any>) => {
    const params = new URLSearchParams();
    params.set('user', options?.authParams?.userName ?? '');
    params.set('limit', String(pageSize.value));
    params.set('sort_by', sortBy.value);
    if (options?.useFirstId) {
      if (firstId.value) {
        params.set('first_id', firstId.value);
      }
    } else if (lastId.value) {
      params.set('last_id', lastId.value);
    }
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    // 和现有代码保持一致，直接走 deepApi 代理
    return `${options?.authParams?.apiBaseUrl}?${params.toString()}`;
  };

  /**
   * @description 实际请求一页数据
   */
  const fetchPage = async (isRefresh = false, params?: Record<string, any>) => {
    if (loading.value || moreLoading.value || !hasMore.value) return;
    isRefresh ? loading.value = true : moreLoading.value = true;
    error.value = null;
    try {
      const url = buildUrl(params);
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${options?.authParams.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }

      const json = await resp.json() as {
        data?: ConversationItem[];
        has_more?: boolean;
        limit?: number;
      };

      const list: ConversationItem[] = json.data ?? [];
      const isFirst = !firstId.value && !lastId.value;
      if (isFirst) {
        // 首次加载或刷新
        items.value = list.map(item => ({
          ...item,
          // 和 useChatContext 中保持一致，去掉 /no_think
          name: item.name?.replace?.('/no_think', '') ?? item.name,
        }));
      } else {
        // 追加下一页
        const appended = list.map(item => ({
          ...item,
          name: item.name?.replace?.('/no_think', '') ?? item.name,
        }));
        items.value = items.value.concat(appended);
      }

      // 更新 firstId 或 lastId
      if (list.length > 0) {
        if (options?.useFirstId) {
          firstId.value = list[0].id;
        } else {
          lastId.value = list[list.length - 1].id;
        }
      }

      hasMore.value = Boolean(json.has_more);
    } catch (e: any) {
      console.error('加载会话历史失败:', e);
      error.value = e?.message ?? '加载失败';
      // 出错时让外部可重试
    } finally {
      isRefresh ? loading.value = false : moreLoading.value = false;
    }
  };

  /**
   * @description 加载下一页
   */
  const loadMore = async (params?: Record<string, any>) => {
    await fetchPage(false, params);
  };

  /**
   * @description 从头刷新列表（重置 last_id，再拉一页）
   */
  const refresh = async (params?: Record<string, any>) => {
    items.value = [];
    lastId.value = null;
    firstId.value = null;
    hasMore.value = true;
    await fetchPage(true, params);
  };

  /**
   * @description 重置状态，不发请求
   */
  const reset = () => {
    items.value = [];
    lastId.value = null;
    firstId.value = null;
    hasMore.value = true;
    loading.value = false;
    error.value = null;
  };

  return {
    items,
    loading,
    moreLoading, // 这里区分下加载更多和初始加载（可能展现的形式有区别）
    error,
    hasMore,
    isEmpty,
    loadMore,
    refresh,
    reset,
    pageSize,
    sortBy,
  };
}


