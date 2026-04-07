<template>
    <div ref="scrollTarget" class="chat-list" @scroll="handleScroll">
        <!-- 顶部开场白 -->
        <div class="chat-welcome-prompt-wrapper" v-if="messageList.length === 0">
            <div class="leading-[20px] tracking-[1px] mb-[10px] text-[16px]">
                👋🏻 <span class="ml-1">Hi,我是您的文档助手：</span>
            </div>
            <p class="text-[var(--sd-text-caption)] text-sm">
                请描述您的问题，我将通过知识点总结、工具诊断、信息检索等能力为您提供服务。
            </p>
        </div>
        <!-- 会话区 -->
        <template v-if="messageList.length">
            <div v-for="(item, index) in messageList" :key="item.answerGroupId" class="message-item-wrapper flex b-4"
                style="padding-right: 5px; padding-left: 5px"
                :class="item.role === 'user' ? 'justify-end' : 'justify-start'">
                <div :class="['content-wrapper', item.role]">

                    <ChatAnswer :show-regenerate="index === messageList.length - 1" :item="item"
                        v-if="item.role === 'assistant'" />
                    <div v-if="item.role === 'user'" :class="['chat-user-prompt-wrapper']">
                        {{ getMessage(item) }}
                    </div>
                </div>

            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { useChatMessage } from '../composables/useChatMessageContext';
import { useChatSession } from '../composables/useChatSessionContext';
import type { MessageItem } from '../composables/types';
import { getMessage } from '../utils/common';
const chatSession = useChatSession();

// 获取消息上下文
const { messageList, scrollTarget, toggleShowBackToLatestMessage, cancelMessage, loadHistoryMessage, loadMoreHistory, messagesHasMore, messagesHistoryMoreLoading } = useChatMessage();

if (chatSession.activeConversationId.value) {
    loadHistoryMessage(chatSession.activeConversationId.value);
}

const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.scrollTop < 10) {
        if (messagesHasMore.value && !messagesHistoryMoreLoading.value) {
            // 上划加载更多
            loadMoreHistory(String(chatSession.activeConversationId.value));
        }
    }
    if (scrollTarget.value) {
        const distanceToBottom = scrollTarget.value?.scrollHeight - target.scrollTop - target.clientHeight;
        toggleShowBackToLatestMessage(distanceToBottom > 300);
    }
};

</script>

<style scoped lang="less">
.chat-list {
    flex: 1;
    overflow: auto;
    padding-left: 16px;
    padding-right: 8px;

    .chat-welcome-prompt-wrapper {
        border: 1px solid #e5e6e8;
        border-radius: 5px;
        padding: 12px;
        overflow-x: auto;
        margin-bottom: 20px;
    }

    .message-item-wrapper {
        margin-bottom: 20px;

        .avatar-wrapper {
            flex-shrink: 0;
        }

        .content-wrapper {
            flex: 1;
            min-width: 0;
            max-width: 320px;

            &.user {
                flex: initial;
            }

            .chat-user-prompt-wrapper {
                flex: initial;
                background-color: #c9e7ff;
                border-radius: 6px 2px 6px 6px;
                border: none;
                padding: 8px 12px;

                .chat-prompt-wrapper {
                    border: none;
                }
            }

            .chat-ai-prompt-wrapper {
                border-radius: 8px;
                overflow-x: auto;
                padding: 2px;


            }


        }
    }
}
</style>