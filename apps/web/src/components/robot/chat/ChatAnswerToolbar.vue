<template>
    <div class="flex items-center gap-2 mt-2">
        <a-tooltip title="重新生成" placement="top"
            v-if="showRegenerate && ['cancel', 'fail', 'over'].includes(item?.status ?? '')">
            <a-button class="shadow-btn-wrapper" type="text" @click="sendQuestion({
                question: item.linkQuestion || '',
                messageId: item.id,
                resend: true,
            })">
                <ReloadOutlined />
            </a-button>
        </a-tooltip>
        <a-tooltip title="复制" placement="top">
            <a-button class="shadow-btn-wrapper" type="text" @click="copyAnswer(item.message)">
                <CopyOutlined />
            </a-button>
        </a-tooltip>
    </div>
</template>

<script setup lang="ts">
import { ReloadOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { useChatMessage } from '../composables/useChatMessageContext';
import type { MessageItem } from '../composables/types';
import { useClipboard } from '@vueuse/core';
import { message } from 'ant-design-vue';
const props = withDefaults(defineProps<{
    item: MessageItem;
    showRegenerate?: boolean;
}>(), {
    item: () => ({
        id: '',
        role: 'assistant',
        message: '',
        status: 'over',
        createdAt: new Date(),
        updatedAt: new Date(),
        linkQuestion: '',
    }),
    showRegenerate: false,
});
const { cancelMessage, sendQuestion } = useChatMessage();
const { copy, copied, isSupported } = useClipboard()
const copyAnswer = (itemMessage: string) => {
    copy(itemMessage);
    message.success('已复制');
};
</script>
