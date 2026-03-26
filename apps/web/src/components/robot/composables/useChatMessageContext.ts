import { ref, nextTick, type Ref } from 'vue';
import { createInjectionState } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { type ChatContext } from './useChatSessionContext';
import { useSseStream } from './useSseStream';
import type { WorkflowStep, ResourceItem, AnswerItem, ChatMessage, ConversationItem } from './types';
import { useRoute, useRouter } from 'vue-router';
import { useLoadMore } from './useDifyLoad';
import { useClipboard } from '@vueuse/core';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { prepareTablesForExport } from './helper';

/**
 * 内层 Message Context - 管理单个会话的消息状态和方法
 */
export interface ChatMessageContext {
  scrollTarget: Ref<HTMLElement | null>; // 滚动容器
  // 会话消息相关
  chatHistory: Ref<ChatMessage[]>;
  inputMessage: Ref<string>;
  currentQuestion: Ref<string>;
  selectedResource: Ref<any | null>;

  // 会话状态
  isRunning: Ref<boolean>;
  isDeepThinking: Ref<boolean>;

  // 计时相关(整个耗时)
  timeConsuming: Ref<number>;

  // 报告数据
  reportData: Ref<string>;

  // 历史记录
  messagesHistoryMoreLoading: Ref<boolean>;
  messagesHasMore: Ref<boolean>;
  // 工作流展开状态
  workflowExpanded: Ref<Record<string, boolean>>;

  // 方法
  sendQuestion: (options: { question?: string, inputs?: Record<string, any>, messageId?: string }) => Promise<void>;
  stopTask: () => Promise<void>;
  loadHistory: (conversationId: string) => Promise<void>;
  loadMoreHistory: (conversationId: string) => Promise<void>;
  clear: () => void;
  toggleWorkflow: (chatIndex: number, answerIndex?: number) => void;
  toggleDeepThinking: () => void;

  // 承载回答的容器
  registerAnswerContainer: (id: string, el: HTMLElement | null) => void;
  getAnswerContainer: (id: string) => HTMLElement | null;
  downloadAnswer: (chatId: string, type: 'pdf' | 'excel' | 'word') => void;
  copyAnswer: (chatId: string) => void;
  regenerateAnswer: (chatId: string) => void;
}

/**
 * 初始化会话状态
 */
function initSessionState(chatContext: ChatContext): ChatSessionContext {
  const { parseStream, createStreamRequest } = useSseStream();
  const router = useRouter();
  const route = useRoute();
  // 状态定义
  const chatHistory = ref<ChatMessage[]>([]);
  const inputMessage = ref('');
  const currentQuestion = ref('');
  const selectedResource = ref<any | null>(null);
  const isRunning = ref(false);
  // 不存在或者true时，默认开启深度思考
  const isDeepThinking = ref(sessionStorage.getItem('zsh_deep') === 'true' || !sessionStorage.getItem('zsh_deep'));
  const timeConsuming = ref(0);
  const reportData = ref('');
  const workflowExpanded = ref<Record<string, boolean>>({});
  // 按回答 id 存 DOM 容器
  const answerContainers = ref<Record<string, HTMLElement | null>>({});

  const registerAnswerContainer = (id: string, el: HTMLElement | null) => {
    if (!el) {
      delete answerContainers.value[id];
    } else {
      answerContainers.value[id] = el;
    }
  };

  const regenerateAnswer = (chatId: string) => {
    const chat = chatHistory.value.find((item) => item.id === chatId);
    if (!chat) return;
    sendQuestion({
      messageId: chatId,
    });
  };

  const getAnswerContainer = (id: string) => {
    return answerContainers.value[id] ?? null;
  };
  // 内部状态
  let timer: any | null = null;
  let taskId = '';

  // 滚动容器
  const scrollTarget = ref<HTMLElement | null>(null);

  // 滚动到最底部
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!scrollTarget.value) return;
    scrollTarget.value.scrollTo({
      top: scrollTarget.value.scrollHeight,
      behavior: behavior,
    });
  };

  /**
   * 清理计时器
   */
  const clearTimers = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  /**
   * 启动计时器
   */
  const startTimers = () => {
    clearTimers();
    timeConsuming.value = 0;

    timer = setInterval(() => {
      timeConsuming.value += 1;
    }, 1000);
  };

  /**
   * 切换深度思考
   */
  const toggleDeepThinking = () => {
    isDeepThinking.value = !isDeepThinking.value;
    sessionStorage.setItem('zsh_deep', isDeepThinking.value ? 'true' : 'false');
  };
  /**
   * 处理 node_started 事件
   */
  const handleNodeStarted = (parsed: any, chatIndex: number, answerIndex?: number) => {
    const step: WorkflowStep = {
      type: parsed.event,
      timestamp: Date.now(),
      eventId: parsed?.data?.id,
      ...parsed,
      elapsed_time: null,
      status: 'loading',
      open: false,
    };
    isRunning.value = true; // 开始响应


    if (answerIndex !== undefined) {
      if (!chatHistory.value[chatIndex].answerList) {
        chatHistory.value[chatIndex].answerList = [];
      }
      const answerList = chatHistory.value[chatIndex].answerList!;
      if (!answerList[answerIndex]) {
        answerList[answerIndex] = {
          name: '',
          answer: '',
          finished: [],
          finishedloading: true,
        };
      }
      answerList[answerIndex].finished.push(step);
    } else {
      chatHistory.value[chatIndex].workflowSteps.push(step);
    }
  };

  /**
   * 处理 node_finished 事件
   */
  const handleNodeFinished = (
    parsed: any,
    chatIndex: number,
    answerIndex?: number,
    textAccumulator?: { value: string }
  ) => {
    if (answerIndex !== undefined) {
      const finished = chatHistory.value[chatIndex].answerList![answerIndex].finished;
      for (let i = 0; i < finished.length; i++) {
        if (parsed?.data?.node_id === finished[i]?.data?.node_id) {
          finished[i].open = true;
          finished[i].type = parsed.event;
          if (finished[i].elapsed_time == null) {
            finished[i].elapsed_time = parsed?.data?.elapsed_time;
          }
          finished[i].status = 'success';

          if (parsed.data?.['node_type'] === 'llm') {
            finished[i].open = true;
            if (
              (parsed?.data?.outputs?.text?.indexOf('think') > -1) ||
              (parsed?.data?.outputs?.text?.indexOf('details') > -1)
            ) {
              if (textAccumulator) {
                textAccumulator.value += parsed?.data?.outputs?.text || '';
                finished[i].content = renderMarkdown(textAccumulator.value);
              }
            }
          }
        }
      }
    } else {
      const workflowSteps = chatHistory.value[chatIndex].workflowSteps;
      const lastIndex = workflowSteps.length - 1;
      if (lastIndex >= 0) {
        if (workflowSteps[lastIndex].elapsed_time == null) {
          workflowSteps[lastIndex].elapsed_time = parsed?.data?.elapsed_time;
        }
        workflowSteps[lastIndex].status = 'success';

        if (parsed.data?.['node_type'] === 'llm') {
          workflowSteps[lastIndex].open = true;
          if (
            (parsed?.data?.outputs?.text?.indexOf('`<think>`') > -1) ||
            (parsed?.data?.outputs?.text?.indexOf('<details>') > -1)
          ) {
            if (textAccumulator) {
              textAccumulator.value += parsed?.data?.outputs?.text || '';
              workflowSteps[lastIndex].content = renderMarkdown(textAccumulator.value);
            }
          }
        }
      }
    }
  };

  /**
   * 处理 message 事件（第一次提问）
   */
  const handleMessage = (parsed: any, chatIndex: number) => {
    // 开启计时器
    if (!chatHistory.value[chatIndex].secondTimer) {
      chatHistory.value[chatIndex].secondTimer = setInterval(() => {
        chatHistory.value[chatIndex].seconds = Number((0.1 + chatHistory.value[chatIndex].seconds).toFixed(1));
      }, 100);
    }
    chatHistory.value[chatIndex].messageLoading = true;
    if (parsed.answer) {
      const currentAnswer = chatHistory.value[chatIndex].answer || '';
      chatHistory.value[chatIndex].answer = currentAnswer + parsed.answer;
      console.log(chatHistory.value[chatIndex].answer);
      if (chatContext.config.value.appType === '2') {
        try {
          const fullAnswer = chatHistory.value[chatIndex].answer || '';
          const list = JSON.parse(fullAnswer);
          if (list && list.length > 0 && list[0].result) {
            chatHistory.value[chatIndex].isReportParams = true; // 追加报告参数标识
            if (list[0].result.length > 0) {
              chatHistory.value[chatIndex].parsedContent = list[0].result;
            } else {
              chatHistory.value[chatIndex].parsedContent = [];
            }
          }
        } catch (e) {
          chatHistory.value[chatIndex].isReportParams = false;
        }
      }
    }
  };

  /**
   * 处理 message 事件（报告生成）
   */
  const handleReportMessage = (parsed: any, chatIndex: number, answerIndex: number) => {
    if (parsed.answer) {
      reportData.value += parsed.answer;
      const answerList = chatHistory.value[chatIndex].answerList!;
      if (answerList[answerIndex]) {
        answerList[answerIndex].answer = reportData.value;
      }
    }
  };

  /**
   * 发送问题/重新发起会话(这里暂不支持重新发起会话，个人感觉dify逻辑有问题，他会创建一些类似子会话的东西)
   */
  const sendQuestion = async (options: {
    question?: string,
    inputs?: Record<string, any>,
    messageId?: string,
  }) => {
    // 重新发起会话
    let newMessage: ChatMessage | null = null;
    if (options.messageId) {
      const tempChat = chatHistory.value.find((item) => item.id === options.messageId);
      if (tempChat) {
        //重置一些值
        tempChat.answer = '';
        tempChat.workflowSteps = [];
        tempChat.parsedContent = [];
        tempChat.isEmpty = false;
        tempChat.isReportParams = false;
        tempChat.answerList = [];
        tempChat.status = 'ready';
        tempChat.secondTimer = null;
        tempChat.seconds = 0;
        newMessage = tempChat;
      }
    } else {
      newMessage = {
        id: '',
        question: options.question || inputMessage.value,
        inputs: options.inputs || {},
        answer: '',
        workflowSteps: [],
        parsedContent: [],
        isEmpty: false,
        isReportParams: false, // 是否是报告参数
        answerList: [],
        thinkAbount: isDeepThinking.value,
        status: 'ready',
        secondTimer: null,
        seconds: 0,
      };
    }
    if (!newMessage.question?.trim()) {
      ElMessage.warning('请输入问题内容');
      return;
    }
    await nextTick(); // 先滚动到底部
    scrollToBottom();
    currentQuestion.value = newMessage.question;


    chatHistory.value.push(newMessage);
    const chatIndex = chatHistory.value.length - 1;

    const config = chatContext.config.value;
    const currentQuestionWithDeep = isDeepThinking.value ? newMessage.question : '/no_think ' + newMessage.question;
    const conversationId = chatContext.activeConversationId.value;

    const params = {
      inputs: newMessage.inputs || {},
      query: currentQuestionWithDeep,
      response_mode: 'streaming',
      conversation_id: conversationId === '0' ? '' : conversationId, // '0' 表示新会话
      user: config.userName,
    };

    let textAccumulator = { value: '' };

    try {
      const reader = await createStreamRequest(config.apiBaseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      for await (const parsed of parseStream(reader)) {
        taskId = parsed.task_id || taskId;
        if (!chatContext.activeConversationId.value) {
          // 刷新左侧list
          await chatContext.loadConversationsHistory();
          router.replace({
            path: route.path,
            query: {
              ...route.query,
              conversationId: (parsed as any).conversation_id,
            },
          });
        }
        // switch (parsed.event) {
        //   // 流程开始
        //   case 'workflow_started':
        //     // 追加messageId作为唯一标识
        //     chatHistory.value[chatIndex].id = parsed.message_id;
        //     chatHistory.value[chatIndex].taskId = parsed.task_id;
        //     chatHistory.value[chatIndex].status = 'loading';
        //     break;
        //   // 节点开始
        //   case 'node_started':
        //     handleNodeStarted(parsed, chatIndex);
        //     break;

        //   case 'node_finished':
        //     handleNodeFinished(parsed, chatIndex, undefined, textAccumulator);
        //     break;

        //   case 'message':
        //     handleMessage(parsed, chatIndex);
        //     break;
        //   case 'message_end':
        //     chatHistory.value[chatIndex].messageLoading = false;
        //     clearInterval(chatHistory.value[chatIndex].secondTimer);
        //     chatHistory.value[chatIndex].status = 'success';
        //     isRunning.value = false;
        //     chatHistory.value[chatIndex].messageEnd = true;
        //     if (!chatHistory.value[chatIndex].answer) {
        //       chatHistory.value[chatIndex].isEmpty = true;
        //     }
        //     break;

        //   case 'workflow_finished':
        //     break;

        //   case 'error':
        //     chatHistory.value[chatIndex].messageLoading = false;
        //     clearInterval(chatHistory.value[chatIndex].secondTimer);
        //     chatHistory.value[chatIndex].status = 'error';
        //     chatHistory.value[chatIndex].messageEnd = true; // 失败也算
        //     ElMessage.error(parsed.message || '请求失败');
        //     break;
        // }
        nextTick(() => {
          scrollToBottom();
        });
      }
    } catch (error) {
      console.error('请求失败:', error);
      ElMessage.error('请求失败，请稍后重试');
      chatHistory.value[chatIndex].status = 'error';
      isRunning.value = false;
    } finally {
      clearTimers();
      isRunning.value = false;
    }
  };

  /**
   * 停止任务
   */
  const stopTask = async () => {
    if (!taskId) return;

    const config = chatContext.config.value;
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/${taskId}/stop`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: config.userName,
          }),
        }
      );

      if (response.status === 200) {
        const targetChat = chatHistory.value.find((item) => item.taskId === taskId) as any;
        if (targetChat) {
          targetChat.status = 'stoped';
          targetChat.messageEnd = true;
        }
        ElMessage.success('任务已停止');
        isRunning.value = false;
        clearTimers();
      }
    } catch (error) {
      console.error('停止任务失败:', error);
      ElMessage.error('停止任务失败');
    }
  };

  // 统一处理响应结果
  const handleFetchedCallback = async (messagesHistory: any[]) => {
    chatHistory.value = [];

    const list = messagesHistory.map((item: any) => {
      let parsedList: ResourceItem[] = [];
      // let reoprtList: AnswerItem[] = [];
      // if (item.answer && chatContext.config.value.appType === '2') {
      //   if (isJSON(item.answer)) {
      //     try {
      //       const parsed = JSON.parse(item.answer);
      //       if (parsed[0]?.result) {
      //         parsedList = parsed[0].result;
      //       }
      //     } catch (e) {
      //       console.error('解析历史答案失败:', e);
      //     }
      //   }
      // }

      // for (let j = 0; j < da.length; j++) {
      //   reoprtList.push({
      //     name: da[j].inputs?.plan_name?.replace('/no_think', '') || '未知问题',
      //     finished: [],
      //     finishedloading: false,
      //     answer: da[j].answer,
      //   });
      // }
      return {
        question: item?.query?.replace('/no_think', ''),
        workflowSteps: [],
        inputs: item.inputs || {},
        id: item.id,
        answer: item.answer,
        isReportParams: parsedList.length > 0,
        parsedContent: parsedList,
        thinkAbount: item.answer.indexOf('<think>') > -1, // 通过结果判断是否开启了深度思考
        messageEnd: true, // 直接完成
        status: 'success' as const,
        answerList: [], // 不知道有什么用
      };
    });

    chatHistory.value = list || [];

    if (chatHistory.value.length > 0) {
      const firstChat = chatHistory.value[0];
      if (firstChat.answerList && firstChat.answerList.length > 0) {
        reportData.value = firstChat.answerList[0].answer;
      }
    }
    await nextTick(); // 滚动到底部(这里不要带过渡效果)
    scrollToBottom('auto');
  }
  // 这里调用加载更多的hook
  const { loadMore: loadMoreMessagesHistory, moreLoading: messagesHistoryMoreLoading, hasMore: messagesHasMore, items: messagesHistory, refresh: initMessagesHistory } = useLoadMore({
    authParams: {
      apiKey: chatContext.config.value.apiKey,
      userName: chatContext.config.value.userName,
      apiBaseUrl: "/deepApi/v1/messages",
    },
    useFirstId: true
  });
  /**
   * 加载历史记录
   */
  const loadHistory = async (conversationId: string) => {
    try {
      await initMessagesHistory({
        conversation_id: conversationId,
      });
      handleFetchedCallback(messagesHistory.value);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };
  // 加载更多历史记录
  const loadMoreHistory = async (conversationId: string) => {
    await loadMoreMessagesHistory({
      conversation_id: conversationId,
    });
    handleFetchedCallback(messagesHistory.value);
  };
  const { copy } = useClipboard();
  // 一些工具方法
  const copyAnswer = (chatId: string) => {
    if (!chatId) return;
    const chat = chatHistory.value.find((item) => item.id === chatId);
    if (chat) {
      copy(chat.answer);
      ElMessage.success('已复制内容');
    } else {
      ElMessage.error('复制失败');
    }
  };
  const exportToPDF = async (options: { title: string, answerContainer: HTMLElement | null }) => {
    try {
      const raw = options.answerContainer;
      if (!raw) throw new Error('找不到内容容器');
      // 找到带样式的外层 .response-content
      const element =
        raw.closest('.response-content') as HTMLElement || raw;
      // 移除 deep-think 和 think-about 标签
      element.querySelectorAll('.deep-think, .think-about').forEach(item => {
        item.remove();
      });
      // 0. 克隆一份离屏 DOM
      const offscreen = document.createElement('div');
      offscreen.id = 'offscreen';
      offscreen.style.position = 'fixed';
      offscreen.style.left = '-99999px';
      offscreen.style.top = '0';
      offscreen.style.width = element.clientWidth + 'px';
      offscreen.style.zIndex = '-1';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.overflowX = 'visible';
      clone.querySelectorAll('.my-echarts').forEach(wrapper => {
        const chart = wrapper.querySelector('.chartContainer');
        const img = wrapper.querySelector('.chart-snapshot');

        if (chart && img) {
          (chart as HTMLElement).style.display = 'none';
          (img as HTMLElement).style.display = 'block';
        }
      });
      // 1. 导出前处理表格：根据宽度决定“拆表 / 去 overflow”
      prepareTablesForExport(clone);
      offscreen.appendChild(clone);

      document.body.appendChild(offscreen);
      // 2. 将HTML转换为Canvas
      const canvas = await html2canvas(clone, {
        useCORS: true,
        width: clone.scrollWidth, // 设置为克隆元素的全部宽度
        height: clone.scrollHeight, // 设置为克隆元素的全部高度
        backgroundColor: "#FFFFFF",
      });

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      const margin = 10;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      // 关键：把“PDF 的 mm”换算成 “canvas 的 px”
      const pxPerMm = canvas.width / usableWidth;
      const pageHeightPx = Math.floor(usableHeight * pxPerMm);

      let renderedHeightPx = 0;
      let pageIndex = 0;

      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext("2d")!;
        // 从大 canvas 裁一段到 pageCanvas
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(pageImgData, "PNG", margin, margin, usableWidth, sliceHeightMm);

        renderedHeightPx += sliceHeightPx;
        pageIndex++;
      }
      // 5. 保存PDF
      pdf.save(options.title);
    } catch (error) {
      console.error("导出PDF失败:", error);
      ElMessage.error("导出PDF时出错: " + error.message);
    } finally {
      // 5. 清理离屏 DOM
      const target = document.getElementById('offscreen');
      if (target && target.parentNode) {
        target.parentNode.removeChild(target);
      }
    }
  };
  // 内容导出
  const downloadAnswer = (chatId: string, type: 'pdf' | 'excel' | 'word') => {
    if (!chatId) {
      ElMessage.error('缺少消息ID');
      return;
    }
    const chat = chatHistory.value.find((item) => item.id === chatId);
    if (!chat) return;
    switch (type) {
      case 'pdf':
        exportToPDF({
          answerContainer: getAnswerContainer(chatId),
          title: `${chat.question}.pdf`,
        });
        break;
    }
  };

  const clear = () => {
    chatHistory.value = [];
    reportData.value = '';
    currentQuestion.value = '';
    selectedResource.value = null;
    workflowExpanded.value = {};
    timeConsuming.value = 0;
  };

  const toggleWorkflow = (chatIndex: number, answerIndex?: number) => {
    const key = answerIndex !== undefined ? `${chatIndex}-${answerIndex}` : `${chatIndex}`;
    workflowExpanded.value[key] = !workflowExpanded.value[key];
  };

  return {
    scrollTarget,
    chatHistory,
    inputMessage,
    isDeepThinking,
    currentQuestion,
    selectedResource,
    timeConsuming,
    reportData,
    workflowExpanded,
    isRunning,
    sendQuestion,
    stopTask,
    loadHistory,
    loadMoreHistory,
    messagesHasMore,
    messagesHistoryMoreLoading,
    clear,
    toggleWorkflow,
    toggleDeepThinking,

    // 操作方法
    copyAnswer,
    downloadAnswer,
    regenerateAnswer,

    registerAnswerContainer,
    getAnswerContainer,
  };
}

const [useChatMessageProvider, useChatMessageOriginal] = createInjectionState(initSessionState);

/**
 * 包装 useChatSession，确保总是返回非空
 */
export const useChatMessage = (): ChatMessageContext => {
  const context = useChatMessageOriginal();
  if (!context) {
    throw new Error('useChatMessage must be used within ChatMessageProvider');
  }
  return context;
};

export { useChatMessageProvider };
