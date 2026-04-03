import { ref, computed } from 'vue';
import type { PaginationResponse } from './types';



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
export function useLoadMore<T, R>(options: {
  // 加载函数注入
  loader: (params: Record<string, any>) => Promise<PaginationResponse<R>>;
  useFirstId?: boolean; // 会话历史消息时候使用
  page?: number;
  /** 每次请求条数，默认 10 */
  page_size?: number;
  /** 排序字段，默认 updated_at:desc,支持多字段，用逗号分隔 */
  sort?: string;
  // 响应列表转换函数
  transformResponseList?: (response: R[]) => T[];
}) {
  const page = ref(options?.page ?? 1);
  const pageSize = ref(options?.page_size ?? 10);
  const sort = ref(options?.sort ?? 'updated_at:desc');

  const items = ref<T[]>([]);
  const loading = ref(false);
  const moreLoading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const isEmpty = computed(() => !loading.value && !moreLoading.value && items.value.length === 0);


  const buildParams = (extraParams?: Record<string, any>) => {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
      sort: sort.value,
      ...extraParams,
    };

    return params;
  };

  /**
   * @description 实际请求一页数据
   */
  const fetchPage = async (isRefresh = false, extraParams?: Record<string, any>) => {
    if (loading.value || moreLoading.value || !hasMore.value) return;
    if (isRefresh) {
      hasMore.value = true;
      items.value = [];
      page.value = 1;
      loading.value = true
    } else {
      moreLoading.value = true;
      page.value++;
    }
    error.value = null;
    try {
      const params = buildParams(extraParams);
      const json = await options.loader(params);
      if (!json.success) {
        throw new Error(json.errMessage ?? '加载失败');
      }

      const list: T[] = options.transformResponseList ? options.transformResponseList(json.data?.items as R[]) : json.data?.items as unknown as T[];
      if (isRefresh) {
        // 首次加载或刷新
        items.value = list;
      } else {
        // 追加下一页
        items.value = [...items.value, ...(list as typeof items.value)];
      }

      hasMore.value = Boolean(json.data?.has_more);
    } catch (e: any) {
      console.error('加载失败:', e);
      error.value = e?.message ?? '加载失败';
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

    await fetchPage(true, params);
  };

  /**
   * @description 重置状态，不发请求
   */
  const reset = () => {
    items.value = [];
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
  };
}


