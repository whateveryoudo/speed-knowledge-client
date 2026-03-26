<template>
  <div :style="style" ref="chatDialogRef" class="chat-cont flex-1 flex flex-col min-w-0 relative bg-[rgb(246,247,249)]">
    <div ref="helperHeaderRef" class="helper-header-wrapper h-[130px] cursor-grab p-[12px] pt-[15px]">
      <AFlex align="center" justify="space-between">
        <ASpace>
          <span>AI助理</span>
        </ASpace>
        <ASpace :size="15">
          <span
            class="cursor-pointer text-[var(--ant-colorTextTertiary)] hover:text-[var(--ant-colorTextSecondary)] text-[12px]"
            >
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
    <div class="flex-1 overflow-y-auto px-4 md:px-8 py-8" ref="scrollTarget" @scroll="handleScroll">
      <div class="flex items-center justify-center py-1" v-if="messagesHistoryMoreLoading && messagesHasMore">
        <el-icon class="animate-spin">
          <Loading />
        </el-icon>
      </div>
      <div class="max-w-[800px] w-full mx-auto flex flex-col">
        <!-- <ChatBody /> -->
      </div>
    </div>
    <div class="max-w-[800px] mx-auto w-full relative pb-[30px]">
      <!-- <ChatArea /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, computed, ref } from 'vue';
import { useChatSessionProvider, useChatSession } from '../composables/useChatMessageContext';
import { useChat } from '../composables/useChatSessionContext';
// import ChatArea from './ChatArea.vue';
// import ChatBody from './ChatBody.vue';
import { useDraggable, useToggle } from '@vueuse/core';
const emits = defineEmits(['update:visible']);


const chatContext = useChat();

// 注入会话上下文
useChatSessionProvider(chatContext);

// 获取会话上下文
const { scrollTarget, clear, loadHistory, loadMoreHistory, messagesHasMore, messagesHistoryMoreLoading } = useChatSession();
// 监听会话ID变化，为新会话，则清空会话上下文，否则加载会话历史
watch(() => chatContext.activeConversationId.value, (newVal: string) => {
  if (!newVal) {
    clear();
  } else {
    if (newVal) {
      loadHistory(String(newVal));
    }
  }

}, {
  immediate: true,
});

const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop < 10) {
    if (messagesHasMore.value && !messagesHistoryMoreLoading.value) {
      loadMoreHistory(String(chatContext.activeConversationId.value));
    }
  }
};
</script>
<style scoped lang="less">
.chat-cont {
  background: #f9f9f9 !important;
}
</style>
