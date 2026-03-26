<template>
    <div v-if="visible" class="chat-dialog" :style="style" ref="chatDialogRef">
        <div ref="helperHeaderRef" class="helper-header-wrapper h-[130px] cursor-grab p-[12px] pt-[15px]">
            <AFlex align="center" justify="space-between">
                <ASpace>
                    <span>AI助理</span>
                </ASpace>
                <ASpace :size="15">
                    <span
                        class="cursor-pointer text-[var(--ant-colorTextTertiary)] hover:text-[var(--ant-colorTextSecondary)] text-[12px]">
                        <SyncOutlined class="mr-1 text-[12px]!" />
                        <span>重新对话</span>
                    </span>
                    <span class="h-[24px] w-[14px] flex cursor-pointer items-center" @click="toggleExpand">
                        <ShrinkOutlined v-if="isExpand" />
                        <ArrowsAltOutlined v-else />
                    </span>
                    <span class="h-[24px] w-[14px] flex items-center" @click="emits('update:visible', false)">
                        <CloseOutlined class="cursor-pointer" />
                    </span>
                </ASpace>
            </AFlex>
        </div>
        <!-- 会话主体 -->
        <!-- 历史会话 -->
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, ref } from 'vue';
import { useChatSessionProvider } from '../composables/useChatSessionContext';
import { useDraggable, useToggle } from '@vueuse/core';
const props = withDefaults(
    defineProps<{
        visible: boolean;
    }>(),
    {
        visible: false,
    },
);
const emits = defineEmits(['update:visible']);
const chatDialogRef = ref<HTMLElement | null>(null);
const helperHeaderRef = ref<HTMLElement | null>(null);
const [isExpand, toggleExpand] = useToggle(true);

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
    // containerElement: inject('zeroFlowDesignRef', ref(null)),
});
const style = computed(() => ({
    left: x.value + 'px',
    top: y.value + 'px',
    height: isExpand.value ? 'calc(100vh - 50px)' : '680px',
}));

// 注入会话上下文(用于初始化会话，历史会话等)
useChatSessionProvider({
    apiKey: '1234567890',
    apiBaseUrl: 'https://api.example.com',
    userName: 'admin',
    appType: '1',
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
}
</style>