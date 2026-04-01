<template>
  <div class="h-full flex flex-col py-[20px]">
    <!-- 主消息内容区 -->
    <ChatBody />
    <!-- 输入区 -->
    <ChatInputArea />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, ref } from 'vue';
import { useChatMessage, useChatMessageProvider } from '../composables/useChatMessageContext';
import { useChatSession } from '../composables/useChatSessionContext';
import ChatInputArea from './ChatInputArea.vue';
import ChatBody from './ChatBody.vue';
const emits = defineEmits(['update:visible']);

const chatSession = useChatSession();
// 注入会话上下文
useChatMessageProvider(chatSession);

</script>
<style scoped lang="less"></style>
