<template>
  <div class="h-full flex flex-col py-[20px]">
    <!-- 主消息内容区 -->
    <ChatBody />
    <!-- 输入区 -->
    <ChatInputArea />
  </div>
</template>

<script setup lang="ts">
import ChatInputArea from './ChatInputArea.vue';
import ChatBody from './ChatBody.vue';
</script>
<style scoped lang="less"></style>
