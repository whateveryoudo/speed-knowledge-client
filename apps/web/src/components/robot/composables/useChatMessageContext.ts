import { ref, nextTick, type Ref, reactive, computed, type ComputedRef } from 'vue';
import { createInjectionState } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { type ChatSessionContext } from './useChatSessionContext';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { nanoid } from 'nanoid';
import type { MessageItem, ConversationItem, ChatMessageResponse, ChatMessageBase } from './types';
import { useRoute, useRouter } from 'vue-router';
import { useLoadMore } from './useDifyLoad';
import { useClipboard } from '@vueuse/core';
import { createRobotApi } from '../api';
import html2canvas from "html2canvas";
import { useToggle } from '@vueuse/core';
import jsPDF from "jspdf";
import { getAttrFormSubMessage } from '../utils/common';
// import { prepareTablesForExport } from './helper';

class RetriableError extends Error { }
class FatalError extends Error { }
const EventStreamContentType = 'text/event-stream';

/**
 * 内层 Message Context - 管理单个会话的消息状态和方法
 */
export interface MessageItemContext {
  scrollTarget: Ref<HTMLElement | null>; // 滚动容器
  // 消息相关
  messageList: Ref<MessageItem[]>;
  inputMessage: Ref<string>;
  isPending: ComputedRef<boolean>;
  isDoing: ComputedRef<boolean>;
  disabledSend: ComputedRef<boolean>;
  showBackToLatestMessage: Ref<boolean>;


  // 历史记录(加载)
  messagesHistoryMoreLoading: Ref<boolean>;
  messagesHasMore: Ref<boolean>;

  // 方法
  sendQuestion: (options: { question?: string, resend?: boolean, messageId?: string }) => Promise<void>;
  cancelMessage: () => void;
  stopTask: () => Promise<void>;
  loadHistoryMessage: (conversationId: string) => Promise<void>;
  loadMoreHistory: (conversationId: string) => Promise<void>;
  toggleShowBackToLatestMessage: (value: boolean) => void;
  handleBackToLatestMessage: () => void;
  startNewConversation: () => void;
  // 承载回答的容器
  registerAnswerContainer: (id: string, el: HTMLElement | null) => void;
  getAnswerContainer: (id: string) => HTMLElement | null;
  downloadAnswer: (chatId: string, type: 'pdf' | 'excel' | 'word') => void;
  copyAnswer: (chatId: string) => void;
  regenerateAnswer: (chatId: string) => void;
}
interface StackInfo {
  controller: AbortController | null;
}
/**
 * 初始化会话状态
 */
function initSessionState(chatContext: ChatSessionContext) {
  // 用于控制取消
  const stackInfo = reactive<StackInfo>({
    controller: null,
  });
  const api = createRobotApi({
    token: chatContext.config.value.token,
    endpoints: chatContext.config.value.endPoints,
  });
  // 这里调用加载更多的hook
  const { loadMore: loadMoreMessagesHistory, moreLoading: messagesHistoryMoreLoading, hasMore: messagesHasMore, items: messageList, refresh: initMessagesHistory } = useLoadMore<MessageItem, ChatMessageResponse>({
    loader: (params: Record<string, any>) => api.listMessages(params),
    sort: 'updated_at:asc',
    transformResponseList: (response: ChatMessageResponse[]): MessageItem[] => {
      return response.map((item: ChatMessageResponse) => {
        // 获取最后一个消息（提取一些公共字段到外层）
        const lastMessage = item.sub_messages[item.sub_messages.length - 1];
        if (!lastMessage) {
          return {
            answerGroupId: item.answer_group_id,
            role: 'assistant',
            currentVersion: undefined,
            subMessages: [],
            status: 'over',
            linkQuestion: '',
          };
        }
        return {
          answerGroupId: item.answer_group_id,
          role: lastMessage.role,
          currentVersion: lastMessage.version, // 初始化现在最新的版本号
          subMessages: item.sub_messages,
          status: 'over',
          linkQuestion: lastMessage.link_question,
        };
      });
    }
  });
  const isPending = computed(() => {
    return messageList.value.some((item: MessageItem) => item?.status === 'pending');
  });
  const isDoing = computed(() => {
    return messageList.value.some((item: MessageItem) => item?.status === 'doing');
  });
  const disabledSend = computed(() => {
    return (inputMessage.value.trim().length === 0 || isPending.value);
  });
  const inputMessage = ref('');
  // 按回答 id 存 DOM 容器
  const answerContainers = ref<Record<string, HTMLElement | null>>({});

  const registerAnswerContainer = (id: string, el: HTMLElement | null) => {
    if (!el) {
      delete answerContainers.value[id];
    } else {
      answerContainers.value[id] = el;
    }
  };

  // 滚动容器
  const scrollTarget = ref<HTMLElement | null>(null);
  // 是否显示回到最新消息
  const [showBackToLatestMessage, toggleShowBackToLatestMessage] = useToggle(false);
  // 滚动到最底部
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!scrollTarget.value) return;
    scrollTarget.value.scrollTo({
      top: scrollTarget.value.scrollHeight,
      behavior: behavior,
    });
  };
  const handleBackToLatestMessage = () => {
    scrollToBottom('auto');
    toggleShowBackToLatestMessage(false);
  };
  // 开启新会话
  const startNewConversation = () => {
    if (!chatContext.activeConversationId.value) {
      message.warning('当前已是最新会话');
      return;
    }
    // 清空选中sessionId
    chatContext.activeConversationId.value = '';
    messageList.value = [];
    inputMessage.value = '';
    showBackToLatestMessage.value = false;
    toggleShowBackToLatestMessage(false);
  };
  const cancelMessage = () => {
    if (stackInfo?.controller) {
      setTimeout(() => {
        stackInfo.controller?.abort();
      }, 0);
      const pendingMessage = messageList.value.find((item: MessageItem) => ['pending', 'doing'].includes(item.status ?? ''));
      if (pendingMessage) {
        updateMsgInfo(pendingMessage.answerGroupId ?? '', { status: 'cancel' });
      }
    }
  };
  // 更新消息信息
  const updateMsgInfo = (answerGroupId: string, attrs: Record<string, any>) => {
    const target = messageList.value.find((item: MessageItem) => item.answerGroupId === answerGroupId);
    if (target) {
      Object.assign(target, attrs);
    }
  };
  // 更新子消息信息
  const updateSubMessageInfo = (answerGroupId: string, subMessageId: string, attrs: Record<string, any>) => {
    const target = messageList.value.find((item: MessageItem) => item.answerGroupId === answerGroupId)?.subMessages.find((subMessage: Partial<ChatMessageBase>) => subMessage.id === subMessageId);
    if (target) {
      Object.assign(target, attrs);
    }
  };
  /**
   * 发送问题/重新发起会话
   */
  const sendQuestion = async (options: {
    question?: string, // 问题内容
    resend?: boolean, // 是否重新发送消息
    answerGroupId?: string, // 答案组id（重新发送时传入）
  }) => {
    if (!options?.question?.trim()) {
      message.warning('请输入问题内容');
      return;
    }
    let answerUserGroupId = nanoid(); // 用户消息组id
    let answerAssistantGroupId = options.answerGroupId || nanoid(); // 机器回答消息组id
    let subUserMessageId = nanoid(); // 用户消息id
    let subAssistantMessageId = nanoid(); // 机器回答消息id
    if (options.resend && options.answerGroupId) {
      // 重新发起会话（这里是追加历史记录）
      const tempChat = messageList.value.find((item) => item.answerGroupId === answerAssistantGroupId);
      if (tempChat && tempChat.subMessages.length > 0) {
        updateMsgInfo(answerUserGroupId, {
          sub_messages: [
            ...tempChat.subMessages,
            // 追加一条新的
            {
              id: subUserMessageId,
              content: options.question,
              role: 'user',
              type: 'text',
              context_json: {},
            }
          ]
        });
      }
    } else {
      // 普通发送消息(插入两条信息)
      messageList.value.push({
        answerGroupId: answerUserGroupId,
        role: 'user',
        subMessages: [{
          id: subUserMessageId,
          content: options.question,
          role: 'user',
          type: 'text',
          context_json: {},
        }],
      });
      // 增加机器回答消息占位
      messageList.value.push({
        answerGroupId: answerAssistantGroupId,
        role: 'assistant',
        subMessages: [{
          id: subAssistantMessageId,
          content: '',
          role: 'assistant',
          type: 'text',
          context_json: {},
        }],
        status: 'pending',
        linkQuestion: options.question, // 保留关联的问题，用于重新发送时使用
      });
    }

    await nextTick(); // 先滚动到底部
    scrollToBottom();
    // 清空输入框信息
    inputMessage.value = '';
    // 获取外部配置
    const config = chatContext.config.value;
    const sessionId = chatContext.activeConversationId.value; // 调用注入的会话id
    const controller = new AbortController();
    stackInfo.controller = controller;
    fetchEventSource(
      `${config.endPoints.stream}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + config.token,
        },
        body: JSON.stringify({
          session_id: sessionId,
          content: options.question,
        }),
        signal: controller.signal,
        async onopen(response: any) {
          if (response.ok && response.headers.get('content-type').includes(EventStreamContentType)) {
            return; // everything's good
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // client-side errors are usually non-retriable:
            throw new FatalError();
          } else {
            throw new RetriableError();
          }
        },
        async onmessage(msg: { data: any; event: string }) {

          if (msg.event === 'FatalError') {
            throw new FatalError(msg.data);
          }
          if (msg.event == '') {
            try {
              const msgTarget = messageList.value.find(
                (item: MessageItem) => item.answerGroupId === answerAssistantGroupId,
              );
              if (!msgTarget) {
                return;
              }
              const data = JSON.parse(msg.data);
              const dataEvent = data.event;
              const targetData = data.data;
              // 区分事件类型
              if (dataEvent === 'context') {
                // 更新会话id
                chatContext.activeConversationId.value = targetData.session_id;
                // 更新上下文信息
                updateSubMessageInfo(answerAssistantGroupId, subAssistantMessageId, { context_json: targetData });
                console.log(messageList.value);
              } else if (dataEvent === 'message') {
                // 调整状态为doing
                updateMsgInfo(answerAssistantGroupId, { status: 'doing' });
                // 同步最新的子消息(注意追加内容)
                const targetMessage = messageList.value.find((item: MessageItem) => item.answerGroupId === answerAssistantGroupId);
                if (targetMessage) {
                  updateSubMessageInfo(answerAssistantGroupId, subAssistantMessageId, { content: (getAttrFormSubMessage(targetMessage, 'content') ?? '') + (targetData || '') });
                }
              } else if (dataEvent === 'done') {
                updateMsgInfo(answerAssistantGroupId, { status: 'over' });
              } else if (dataEvent === 'error') {
                updateSubMessageInfo(answerAssistantGroupId, subAssistantMessageId, { status: 'fail', content: targetData || '消息发送失败，请重试。' });
                return;
              }

            } catch (error) {
              cancelMessage();
              updateSubMessageInfo(answerAssistantGroupId, subAssistantMessageId, { status: 'fail' });
              // 错误处理，提示用户
              message.error('消息发送失败，请重试。');
            }
          }
        },
        onclose() {
          // 重置状态
          const curStatus = messageList.value.find((item: MessageItem) => item.answerGroupId === answerAssistantGroupId)?.status;
          if (curStatus === 'fail') {
            return;
          }
          updateMsgInfo(answerAssistantGroupId, { status: 'over' });
        },
        onerror(e: Error) {
          console.log(e);
          cancelMessage();
          updateMsgInfo(answerAssistantGroupId, { status: 'fail' });
          // 错误处理，提示用户
          message.error('消息发送失败，请重试。');
        },
      },
    );
  };


  /**
   * 加载历史消息
   */
  const loadHistoryMessage = async (conversationId: string) => {
    try {
      await initMessagesHistory({
        conversation_id: conversationId,
      });
      await nextTick();
      scrollToBottom();
    } catch (error) {
      console.error('加载历史消息失败:', error);
    }
  };
  // 加载更多历史记录
  const loadMoreHistory = async (conversationId: string) => {
    await loadMoreMessagesHistory({
      conversation_id: conversationId,
    });
  };
  const { copy } = useClipboard();
  // 一些工具方法
  const copyAnswer = (chatId: string) => {
    if (!chatId) return;
    const chat = messageList.value.find((item) => item.answerGroupId === chatId);
    if (chat) {
      const curSubMessage = chat.subMessages.find((subMessage: Partial<ChatMessageBase>) => subMessage.version === chat.currentVersion);
      copy(curSubMessage?.content ?? '');
      message.success('已复制内容');
    } else {
      message.error('复制失败');
    }
  };
  // const exportToPDF = async (options: { title: string, answerContainer: HTMLElement | null }) => {
  //   try {
  //     const raw = options.answerContainer;
  //     if (!raw) throw new Error('找不到内容容器');
  //     // 找到带样式的外层 .response-content
  //     const element =
  //       raw.closest('.response-content') as HTMLElement || raw;
  //     // 移除 deep-think 和 think-about 标签
  //     element.querySelectorAll('.deep-think, .think-about').forEach(item => {
  //       item.remove();
  //     });
  //     // 0. 克隆一份离屏 DOM
  //     const offscreen = document.createElement('div');
  //     offscreen.id = 'offscreen';
  //     offscreen.style.position = 'fixed';
  //     offscreen.style.left = '-99999px';
  //     offscreen.style.top = '0';
  //     offscreen.style.width = element.clientWidth + 'px';
  //     offscreen.style.zIndex = '-1';

  //     const clone = element.cloneNode(true) as HTMLElement;
  //     clone.style.overflowX = 'visible';
  //     clone.querySelectorAll('.my-echarts').forEach(wrapper => {
  //       const chart = wrapper.querySelector('.chartContainer');
  //       const img = wrapper.querySelector('.chart-snapshot');

  //       if (chart && img) {
  //         (chart as HTMLElement).style.display = 'none';
  //         (img as HTMLElement).style.display = 'block';
  //       }
  //     });
  //     // 1. 导出前处理表格：根据宽度决定“拆表 / 去 overflow”
  //     prepareTablesForExport(clone);
  //     offscreen.appendChild(clone);

  //     document.body.appendChild(offscreen);
  //     // 2. 将HTML转换为Canvas
  //     const canvas = await html2canvas(clone, {
  //       useCORS: true,
  //       width: clone.scrollWidth, // 设置为克隆元素的全部宽度
  //       height: clone.scrollHeight, // 设置为克隆元素的全部高度
  //       backgroundColor: "#FFFFFF",
  //     });

  //     const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  //     const margin = 10;
  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();
  //     const usableWidth = pageWidth - margin * 2;
  //     const usableHeight = pageHeight - margin * 2;

  //     // 关键：把“PDF 的 mm”换算成 “canvas 的 px”
  //     const pxPerMm = canvas.width / usableWidth;
  //     const pageHeightPx = Math.floor(usableHeight * pxPerMm);

  //     let renderedHeightPx = 0;
  //     let pageIndex = 0;

  //     while (renderedHeightPx < canvas.height) {
  //       const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

  //       const pageCanvas = document.createElement("canvas");
  //       pageCanvas.width = canvas.width;
  //       pageCanvas.height = sliceHeightPx;

  //       const ctx = pageCanvas.getContext("2d")!;
  //       // 从大 canvas 裁一段到 pageCanvas
  //       ctx.drawImage(
  //         canvas,
  //         0,
  //         renderedHeightPx,
  //         canvas.width,
  //         sliceHeightPx,
  //         0,
  //         0,
  //         canvas.width,
  //         sliceHeightPx
  //       );

  //       const pageImgData = pageCanvas.toDataURL("image/png");
  //       const sliceHeightMm = sliceHeightPx / pxPerMm;

  //       if (pageIndex > 0) pdf.addPage();
  //       pdf.addImage(pageImgData, "PNG", margin, margin, usableWidth, sliceHeightMm);

  //       renderedHeightPx += sliceHeightPx;
  //       pageIndex++;
  //     }
  //     // 5. 保存PDF
  //     pdf.save(options.title);
  //   } catch (error) {
  //     console.error("导出PDF失败:", error);
  //     ElMessage.error("导出PDF时出错: " + error.message);
  //   } finally {
  //     // 5. 清理离屏 DOM
  //     const target = document.getElementById('offscreen');
  //     if (target && target.parentNode) {
  //       target.parentNode.removeChild(target);
  //     }
  //   }
  // };
  // 内容导出
  // const downloadAnswer = (chatId: string, type: 'pdf' | 'excel' | 'word') => {
  //   if (!chatId) {
  //     ElMessage.error('缺少消息ID');
  //     return;
  //   }
  //   const chat = chatHistory.value.find((item) => item.id === chatId);
  //   if (!chat) return;
  //   switch (type) {
  //     case 'pdf':
  //       exportToPDF({
  //         answerContainer: getAnswerContainer(chatId),
  //         title: `${chat.question}.pdf`,
  //       });
  //       break;
  //   }
  // };
  return {
    isPending,
    isDoing,
    disabledSend,
    inputMessage,
    showBackToLatestMessage,
    toggleShowBackToLatestMessage,
    scrollTarget,
    messageList,
    sendQuestion,
    cancelMessage,
    loadHistoryMessage,
    loadMoreHistory,
    messagesHasMore,
    messagesHistoryMoreLoading,
    handleBackToLatestMessage,
    copyAnswer,
    startNewConversation
  };
}

const [useChatMessageProvider, useChatMessageOriginal] = createInjectionState(initSessionState);

/**
 * 包装 useChatSession，确保总是返回非空
 */
export const useChatMessage = (): MessageItemContext => {
  const context = useChatMessageOriginal();
  if (!context) {
    throw new Error('useChatMessage must be used within ChatMessageProvider');
  }
  return context;
};

export { useChatMessageProvider };
