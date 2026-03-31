<template>
    <div class="chat-answer-wrapper">
        <div v-if="item.role === 'assistant'"
            :class="['chat-ai-prompt-wrapper', item.status === 'pending' && 'loading']">
            <div class="chat-ai-inner-wrapper">
                <ASpace v-if="item?.status === 'pending'">
                    <img :src="AiMsgLoadingIcon" class="h-[16px] w-[16px]" />
                    {{ item.status === 'pending' ? '正在生成中，请稍等...' : '正在生成中，请稍等...' }}
                </ASpace>

                <div v-else>
                    <div class="message-preview">
                        <AFlex class="pb-[12px] pt-[2px] text-[16px] text-[var(--sd-grey-8)]">
                            回答
                        </AFlex>
                    </div>
                    <!-- 这里停止是瞬发的 -->
                    <p v-if="item.status === 'cancel'" class="text-[var(--sd-text-caption)]">
                        {{ item.status === 'cancel' ? '已停止生成' : '已停止生成' }}
                    </p>
                    <Markdown v-else-if="item.status !== 'fail'" :value="item.message" :context="item.context" />
                    <p v-else-if="item.status === 'fail'" class="text-[var(--sd-red-6)]">
                        {{ item.message || '消息发送失败，请重试。' }}
                    </p>
                </div>
            </div>
        </div>
        <!-- 消息底部操作栏 -->
        <ChatAnswerToolbar :item="item" />
    </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick, createApp } from "vue";
import type { MessageItem } from '../composables/types';
import AiMsgLoadingIcon from '#sk-web/assets/images/robot/ai-msg-loading.gif';
import Markdown from './Markdown.vue';
import { useChatMessage } from '../composables/useChatMessageContext';
import ChatAnswerToolbar from './ChatAnswerToolbar.vue';
const { cancelMessage, sendQuestion } = useChatMessage();
const props = withDefaults(defineProps<{
    item: MessageItem;
}>(), {
    item: () => ({
        role: 'assistant',
        message: '',
        status: 'pending',
    }),
});
</script>
<style lang="less">
@keyframes light-gradient-border-rotate {
    0% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 180deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    5% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 198deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    10% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 216deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    15% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 234deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    20% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 252deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    25% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 270deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    30% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 288deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    35% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 306deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    40% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 324deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    45% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 342deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    50% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 1turn,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    55% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 378deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    60% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 396deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    65% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 414deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    70% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 432deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    75% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 450deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    80% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 468deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    85% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 486deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    90% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 504deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    95% {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 522deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }

    to {
        background-image: linear-gradient(to right,
                var(--im_chat_message_other_bg_color, transparent),
                var(--im_chat_message_other_bg_color, transparent)),
            conic-gradient(from 540deg,
                #ffbaf6 0,
                #b9adff 60deg,
                #80bfff 120deg,
                #adf7ff 180deg,
                #e9ccff 240deg,
                #ffc29c 300deg,
                #ffbaf6 1turn);
    }
}
</style>
<style lang="less" scoped>
.chat-ai-inner-wrapper {
    background-color: #fff;
    border-radius: 8px;
    padding: 12px;
}

.chat-ai-prompt-wrapper {
    border: 1px solid #e5e6e8;
    padding: 1px;
    border-radius: 8px;
}

.chat-ai-prompt-wrapper.loading {
    border-color: transparent;
    animation: light-gradient-border-rotate 2.5s linear infinite;
    color: rgba(23, 26, 29, 0.4);
}
</style>