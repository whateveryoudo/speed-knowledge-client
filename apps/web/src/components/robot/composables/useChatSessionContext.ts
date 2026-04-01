import { createInjectionState } from '@vueuse/core';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createRobotApi } from '../api';
import type { ChatMessage, WorkflowStep, AgentParameters, ConversationItem, ChatConfig } from './types';
import { useLoadMore } from './useDifyLoad';
/**
 * Chat Session 上下文接口
 */
export interface ChatSessionContext {

  conversationsParameters: Ref<AgentParameters>;
  conversationsHistory: Ref<ConversationItem[]>; // 会话历史列表
  conversationsHistoryLoading: Ref<boolean>;
  conversationsHistoryMoreLoading: Ref<boolean>
  renameConversationLoading: Ref<boolean>;
  activeConversationId: Ref<string>;
  isSidebarOpen: Ref<boolean>;
  displayHistory: Ref<boolean>;

  // 配置
  config: ComputedRef<ChatConfig>;

  // 方法
  clear: () => void;
  loadConversationsHistory: () => Promise<void>;
  initConversationsParameters: () => Promise<void>;
  loadMoreConversationsHistory: () => Promise<void>;
  conversationsHasMore: Ref<boolean>;
  startNewChat: () => void;
  renameConversation: (id: string, name: string, cb: (data: any) => void) => Promise<void>;
  deleteConversation: (id: string, cb: () => void) => Promise<void>;
}

/**
 * 初始化 Chat 状态
 */
function initChatState(config: ChatConfig): ChatSessionContext {
  const route = useRoute();
  const router = useRouter();
  const api = createRobotApi({
    token: config.token,
    endpoints: config.endPoints,
  });
  // 这里调用加载更多的hook
  const { loading: conversationsHistoryLoading, moreLoading: conversationsHistoryMoreLoading, loadMore: loadMoreConversationsHistory, hasMore: conversationsHasMore, items: conversationsHistory, refresh: loadConversationsHistory } = useLoadMore<ConversationItem>({
    loader: (params: Record<string, any>) => api.listConversations(params),
  });
  const activeConversationId = ref('');
  const isSidebarOpen = ref(true);
  const configRef = computed(() => config);
  const displayHistory = ref(false); // 是否显示历史会话列表
  // 智能体的参数
  const conversationsParameters = ref<AgentParameters>({});

  const renameConversationLoading = ref(false);

  const startNewChat = () => {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        conversationId: undefined,
      },
    });
    //   // 左侧追加一个默认项
    //   conversationsHistory.value.unshift({
    //     id: '0',
    //     name: '新的会话',
    //     created_at: new Date().toISOString(),
    //     inputs: {},
    //     introduction: '',
    //     status: 'normal',
    //     updated_at: new Date().toISOString(),
    //   });
    //   router.replace({
    //     path: route.path,
    //     query: {
    //       ...route.query,
    //       conversationId: activeConversationId.value,
    //     },
    //   });
    // }

  };

  // 加载会话历史
  // const loadConversationsHistory = async () => {

  //   const API_BASE_URL =
  //     "/deepApi/v1/conversations?limit=50&user=" + config.userName;
  //   const response = await fetch(API_BASE_URL, {
  //     method: "GET",
  //     headers: {
  //       Authorization: `Bearer ${config.apiKey}`,
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   const data = await response.json();
  //   conversationsHistory.value = data?.data.map((item: ConversationItem) => {
  //     return {
  //       ...item,
  //       name: item.name.replace("/no_think", ""),
  //     };
  //   }) ?? [];
  // };

  const clear = () => {
    conversationsHistory.value = [];
    conversationsHistoryLoading.value = false;
    activeConversationId.value = '';
    isSidebarOpen.value = true;
  };




  const renameConversation = async (id: string, name: string, cb: (data: any) => void) => {
    const API_BASE_URL =
      "/deepApi/v1/conversations/" + id + '/name';
    renameConversationLoading.value = true
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, user: config.token }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data) {
      renameConversationLoading.value = false;
      cb(data);
    }

  }
  // 删除会话后跳转下一个会话
  const setNextConversationNode = (nodeId: string) => {
    if (!nodeId || nodeId !== activeConversationId.value) {
      // 如果删除不是当前选中，则不管
      return
    }
    const index = conversationsHistory.value.findIndex((item) => item.id === nodeId)
    if (index !== -1) {
      if (index === conversationsHistory.value.length - 1) {
        // 如果是最后一项，则找上一个
        const prevNode = conversationsHistory.value[index - 1]
        if (prevNode) {
          router.push({
            path: route.path,
            query: {
              ...route.query,
              conversationId: prevNode.id,
            },
          })
        }
      } else {
        // 找下一个
        const nextNode = conversationsHistory.value[index + 1]
        if (nextNode) {
          router.push({
            path: route.path,
            query: {
              ...route.query,
              conversationId: nextNode.id,
            },
          })
        }
      }
    }
  }
  const deleteConversation = async (id: string, cb: () => void) => {
    const API_BASE_URL =
      "/deepApi/v1/conversations/" + id;
    const response = await fetch(API_BASE_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: config.token }),
    });
    if (response.status === 204) {
      // 调整左侧菜单顺序
      setNextConversationNode(id);
      // 删除此行
      conversationsHistory.value = conversationsHistory.value.filter((item) => item.id !== id);
      cb();
    }
    
  }

  return {
    conversationsParameters,
    conversationsHistoryLoading,
    conversationsHistoryMoreLoading,
    renameConversationLoading,
    conversationsHistory,
    activeConversationId,
    isSidebarOpen,
    config: configRef,
    clear,
    loadConversationsHistory,
    loadMoreConversationsHistory,
    conversationsHasMore,
    startNewChat,
    displayHistory,
    renameConversation,
    deleteConversation,
  };
}

const [useChatSessionProvider, useChatSessionOriginal] = createInjectionState(initChatState);

/**
 * 包装 useChat，确保总是返回非空（带类型守卫）
 */
export const useChatSession = (): ChatSessionContext => {
  const context = useChatSessionOriginal();
  if (!context) {
    throw new Error('useChatSession must be used within ChatSessionProvider');
  }
  return context;
};

export { useChatSessionProvider };

