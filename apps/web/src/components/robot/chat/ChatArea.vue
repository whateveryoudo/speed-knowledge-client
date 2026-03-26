<template>
    <div class="relative">
        <div
            class="border border-slate-200 pt-2 rounded-2xl pb-10 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
            <textarea v-model="inputMessage"
                @keydown.enter.prevent="(e: any) => sendQuestion({ question: e.target.value })"
                placeholder="发消息或输入 / 选择技能"
                :maxlength="2000"
                class="w-full bg-transparent border-none rounded-2xl px-4  text-[15px] focus:outline-none resize-none text-slate-700 placeholder:text-slate-400"
                rows="1" style="min-height: 60px; max-height: 180px;"></textarea>
        </div>
        <!-- Bottom Toolbar -->
        <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2">
            <!-- Left: Deep Thinking Button -->
            <button @click="toggleDeepThinking"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-bold"
                :class="isDeepThinking
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-gray-600 hover:border-gray-200 hover:bg-gray-50'">
                <InfinityIcon class="w-3.5 h-3.5" />
                深度思考
            </button>

            <!-- Right: Model Badge + Send Button -->
            <div class="flex items-center gap-3">
                <!-- Model Badge -->
                <div class="hidden sm:flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                    <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    <span>deepseekR1-70B</span>
                </div>
                <!-- Send Button - Using System Theme Color (Blue) -->
                <button @click="sendQuestion({
                    question: inputMessage.trim(),
                })" :disabled="!inputMessage.trim() || isRunning"
                    class="w-9 h-9 rounded-full flex items-center justify-center transition-all" :class="(!inputMessage.trim() || isRunning)
                        ? 'bg-[rgb(224,232,240)] text-[rgb(170,182,196)] cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'">
                    <ArrowUpIcon class="w-4 h-4" />
                </button>
            </div>
        </div>

        <!-- Stop Button (Visible only when streaming) -->
        <button @click="stopTask" v-if="isRunning"
            class="text-[14px] border-[0.5px] bg-white border-[#10182824] py-1 px-2 absolute top-[-40px] left-[50%] transform -translate-x-1/2  rounded transition-all flex items-center justify-center shadow-sm">
            <PauseIcon class="w-4 h-4 mr-1" />
            停止生成
        </button>
    </div>

</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useChatSession } from '../composables/useChatMessageContext';
import { InfinityIcon, ArrowUpIcon, PauseIcon } from '@/libs/Icons';

const { inputMessage, isDeepThinking, toggleDeepThinking, sendQuestion, isRunning, stopTask } = useChatSession();


</script>