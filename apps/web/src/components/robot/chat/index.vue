<template>
    <div v-if="visible" class="chat-dialog" :style="style" ref="chatDialogRef">
        <div ref="helperHeaderRef" class="helper-header-wrapper h-[130px] p-[12px] pt-[15px]">
            <AFlex align="center" justify="space-between">
                <ASpace>
                    <img :src="AiLogo" class="h-[18px] w-[18px]" alt="" />
                    <span>文档助手</span>
                </ASpace>
                <ASpace>
                    <a-button type="text" class="shadow-btn-wrapper">
                        <SyncOutlined />
                        <span>重新对话</span>
                    </a-button>
                    <a-button type="text" class="shadow-btn-wrapper w-[28px]" @click="toggleExpand()">
                        <ShrinkOutlined v-if="isExpand" />
                        <ArrowsAltOutlined v-else />
                    </a-button>
                    <a-button type="text" class="shadow-btn-wrapper w-[28px]" @click="emits('update:visible', false)">
                        <CloseOutlined />
                    </a-button>
                </ASpace>
            </AFlex>
        </div>
        <component :is="displayComponent" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useChatSessionProvider } from '../composables/useChatSessionContext';
import { useDraggable } from '@vueuse/core';
import AiLogo from '#sk-web/assets/images/robot/ai-icon-0.svg';
import { SyncOutlined, ShrinkOutlined, ArrowsAltOutlined, CloseOutlined } from '@ant-design/icons-vue';
import ChatMain from './ChatMain.vue';
import ChatHistory from './ChatHistory.vue';
import type { ChatConfig } from '../composables/types';
const props = withDefaults(
    defineProps<{
        visible: boolean;
        config: ChatConfig;
    }>(),
    {
        visible: false,
    },
);
const emits = defineEmits(['update:visible']);
const displayHistory = ref(false);
const displayComponent = computed(() => displayHistory.value ? ChatHistory : ChatMain);
const chatDialogRef = ref<HTMLElement | null>(null);
const helperHeaderRef = ref<HTMLElement | null>(null);
const isExpand = ref(true);

const BASE_RIGHT = 0;
const BASE_BOTTOM = 0;
const initX = document.documentElement.clientWidth - BASE_RIGHT - 420;
const initY =
    document.documentElement.clientHeight -
    BASE_BOTTOM -
    (document.documentElement.clientHeight - 50);
const initCollapseY = document.documentElement.clientHeight - BASE_BOTTOM - 680;
const { x, y } = useDraggable(chatDialogRef, {
    initialValue: {
        x: initX,
        y: initY,
    },
    handle: helperHeaderRef,
    containerElement: document.body,
});
const toggleExpand = () => {
    // 还原定位
    x.value = initX;
    y.value = isExpand.value ? initCollapseY : initY;
    isExpand.value = !isExpand.value;
};
const style = computed(() => ({
    left: x.value + 'px',
    top: y.value + 'px',
    height: isExpand.value ? 'calc(100vh - 50px)' : '680px',
}));

// 注入会话上下文(用于初始化会话，历史会话等)
useChatSessionProvider({
    token: props.config.token,
    baseUrl: props.config.baseUrl,
});

// 获取会话上下文
// const { scrollTarget, clear, loadHistory, loadMoreHistory, messagesHasMore, messagesHistoryMoreLoading } = useChatSession();
// // 监听会话ID变化，为新会话，则清空会话上下文，否则加载会话历史
// watch(() => chatSessionContext.activeConversationId.value, (newVal: string) => {
//     if (!newVal) {
//         clear();
//     } else {
//         if (newVal) {
//             loadHistory(String(newVal));
//         }
//     }

// }, {
//     immediate: true,
// });

</script>
<style scoped lang="less">
.chat-dialog {
    position: fixed;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.1);
    width: 420px;
    max-height: calc(100vh - 50px);
    // 这里会和fade冲突，显示隐藏就不过渡了
    transition: height 0.2s ease-in-out;
    border: 1px solid #e5e6e8;
    z-index: 100;

    .helper-header-wrapper {
        background: url('../../../assets/images/robot/ai-head-bg.png') no-repeat center;
        background-size: 100% 100%;
    }
}
</style>