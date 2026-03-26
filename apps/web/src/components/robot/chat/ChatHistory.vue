<template>

    <div class="smart-data-query bg-white flex-shrink-0 flex flex-col z-10 transition-all duration-300 ease-in-out overflow-hidden"
        :class="isSidebarOpen ? 'w-[280px]' : 'w-0'">
        <!-- Sidebar Header -->
        <div
            class="h-[60px] flex items-center justify-between px-4 border-b border-slate-100/80 flex-shrink-0 from-white to-slate-50/50">
            <h2 class="font-semibold text-slate-800 flex items-center gap-2.5 truncate pr-2">
                <!-- <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ring-1 ring-slate-100"
                    :class="getColorClass(activeAgent.color)">
                    <component :is="activeAgent.icon" class="w-5 h-5" />
                </div> -->
                <span class="truncate text-[15px]" :title="activeAgent.title">{{ activeAgent.title }}</span>
            </h2>
            <button @click="isSidebarOpen = false"
                class="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0">
                <ChevronLeftIcon class="w-5 h-5" />
            </button>
        </div>

        <!-- New Chat Button - Using System Theme Color (Blue) -->
        <div class="p-4 create-new-chat">
            <button @click="startNewChat"
                class="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl font-medium text-sm justify-center">
                <!-- <PlusIcon class="w-4 h-4" />  -->
                <svg data-v-e23908ae="" t="1752641977067" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4591" xmlns:xlink="http://www.w3.org/1999/xlink" width="15" height="15" fill="rgb(0, 82, 217)"><path d="M512 983.04H143.36c-25.6 0-51.2-10.24-71.68-30.72-20.48-20.48-30.72-46.08-30.72-71.68V512c0-122.88 51.2-245.76 138.24-332.8C266.24 92.16 384 40.96 512 40.96c122.88 0 245.76 51.2 332.8 138.24C931.84 266.24 983.04 384 983.04 512c0 122.88-51.2 245.76-138.24 332.8-87.04 87.04-209.92 138.24-332.8 138.24z m0-849.92c-102.4 0-194.56 40.96-266.24 112.64S133.12 409.6 133.12 512v368.64c0 5.12 0 5.12 5.12 5.12l5.12 5.12H512c102.4 0 194.56-40.96 266.24-112.64S890.88 614.4 890.88 512s-40.96-194.56-112.64-266.24S614.4 133.12 512 133.12z" fill="" p-id="4592"></path><path d="M322.56 471.04h373.76c15.36 0 25.6 10.24 25.6 25.6v35.84c0 15.36-10.24 25.6-25.6 25.6H322.56c-15.36 0-25.6-10.24-25.6-25.6v-35.84c0-15.36 15.36-25.6 25.6-25.6z" fill="" p-id="4593"></path><path d="M552.96 322.56v373.76c0 15.36-10.24 25.6-25.6 25.6h-30.72c-15.36 0-25.6-10.24-25.6-25.6V322.56c0-15.36 10.24-25.6 25.6-25.6h35.84c10.24 0 20.48 15.36 20.48 25.6z" fill="" p-id="4594"></path></svg>
                新建对话
            </button>
        </div>

        <!-- History List -->
        <el-skeleton :style="{ padding: conversationsHistoryLoading ? '0 12px' : '0' }" :rows="7"
            :loading="conversationsHistoryLoading" animated>
            <template #template>
                <el-skeleton-item variant="text" style="margin-right: 16px" />
                <el-skeleton-item variant="text" style="width: 30%" />
            </template>
            <template #default>
                <div class="flex-1 overflow-y-auto px-3 py-1 custom-scrollbar" @scroll="handleScroll">
                    <div v-if="conversationsHistory.length > 0" class="flex flex-col gap-0.5">
                        <div v-for="item in conversationsHistory" :key="item.id" @click="router.replace({
                            path: route.path,
                            query: {
                                ...route.query,
                                conversationId: item.id,
                            },
                        })" class="group h-[40px] flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer relative"
                            :class="activeConversationId === item.id
                                ? 'bg-blue-50/80 text-blue-700'
                                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'">
                            <!-- Active Indicator -->
                            <!-- <div v-if="activeConversationId === item.id"
                                class="absolute left-0 top-2 bottom-2 w-[3px] bg-blue-500 rounded-r-full"></div> -->

                            <!-- <MessageSquareIcon class="w-4 h-4 flex-shrink-0 opacity-60" /> -->
                            <div class="flex-1 min-w-0">
                                <div :title="item.name" class="text-sm truncate leading-tight font-medium">
                                    {{ item.name }}
                                </div>
                            </div>
                            <!-- 不显示时间，太占位置了 -->
                            <!-- <span class="text-[12px] opacity-50 font-medium flex-shrink-0">{{
                                getRecentTime(item.created_at)
                            }}</span> -->
                            <el-dropdown placement="bottom-start" trigger="click"
                                @command="(command) => handleCommand(command, item)">
                                <span @click.stop
                                    class="w-6 px-1 h-6 flex-shrink-0 group-hover:flex hidden items-center justify-center hover:bg-slate-200 rounded">
                                    <MoreHorizontalIconFilled />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                        <el-dropdown-item divided command="delete">删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>


                        </div>
                        <div class="flex items-center justify-center py-1"
                            v-if="conversationsHistoryMoreLoading && conversationsHasMore">
                            <el-icon class="animate-spin">
                                <Loading />
                            </el-icon>
                        </div>
                    </div>
                    <div v-else class="text-center py-12 text-slate-400 text-sm">
                        <MessageSquareIcon class="w-8 h-8 mx-auto mb-2 opacity-30" />
                        暂无历史记录
                    </div>
                </div>
            </template>

        </el-skeleton>

        <!-- Back Button -->
        <div class="p-4 border-t border-slate-100/80 bg-slate-50/30">
            <button @click="router.push('/intelligentService')"
                class="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm">
                <ChevronLeftIcon class="w-4 h-4" /> 返回服务中心
            </button>
        </div>
        <!-- 重命名 -->
        <el-dialog v-model="renameDialogVisible" title="重命名" width="500px">
            <el-input v-model="renameInput" maxlength="30" show-word-limit placeholder="请输入新的名称"
                @change="handleRenameChange" />
            <template #footer>
                <el-button @click="renameDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleRenameConfirm"
                    :loading="renameConversationLoading">确定</el-button>
            </template>
        </el-dialog>
    </div>

</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChat } from '../composables/useChatSessionContext';
import { MessageSquareIcon, ChevronLeftIcon, PlusIcon, MoreHorizontalIconFilled } from '@/libs/Icons';
import { useRouter, useRoute } from 'vue-router';
import { getRecentTime } from '@/utils/tools';
import type { ConversationItem } from '../composables/types';
import { ElMessage, ElMessageBox } from 'element-plus';

const {
    conversationsHistory,
    conversationsHistoryLoading,
    conversationsHistoryMoreLoading,
    conversationsHasMore,
    loadMoreConversationsHistory,
    startNewChat,
    activeConversationId,
    isSidebarOpen,
    getColorClass,
    config,
    renameConversation,
    renameConversationLoading,
    deleteConversation,
} = useChat();
const activeAgent = computed(() => {
    return config.value.agentInfo;
});

const router = useRouter();
const route = useRoute();
const renameDialogVisible = ref(false);
const renameInput = ref<string>('');

const currentItem = ref<ConversationItem>(null); // 操作行item
const handleRenameConfirm = () => {
    if (!renameInput.value) {
        ElMessage.error('会话名称不能为空');
        return;
    }
    renameConversation(currentItem.value.id, renameInput.value, (data: any) => {
        renameDialogVisible.value = false;
        currentItem.value.name = data.name;
    });
}
const handleRenameChange = (value: string) => {
    renameInput.value = value;
}

// 左侧历史列表滚动加载更多（滚动到底部时触发）
const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (nearBottom && conversationsHasMore.value && !conversationsHistoryLoading.value) {
        loadMoreConversationsHistory();
    }
};
const handleCommand = (command: string, item: any) => {
    if (command === 'rename') {
        currentItem.value = item;
        renameInput.value = item.name;
        renameDialogVisible.value = true;
    } else if (command === 'delete') {

        ElMessageBox({
            title: '确定删除该会话吗？',
            message: '删除后，对话记录不可恢复，对话内的文件也将彻底被删除。',
            type: 'warning',
            showCancelButton: true,
            beforeClose: (action, instance, done) => {
                if (action === 'confirm') {
                    instance.confirmButtonLoading = true
                    deleteConversation(item.id, () => {
                        ElMessage.success('删除成功');
                        done();
                    });
                } else {
                    done();
                }
            },
        })
    }
}
</script>
<style lang="scss" scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e2e8f0;
    border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #cbd5e1;
}
.smart-data-query{
    background:#f7f8fa;
    .create-new-chat{
        button{
            background: rgba(0, 82, 217, 0.1);
            border: 1px solid;
            border-color: #99baf0; // #a4e3d3
            box-sizing: border-box;
            color: #0052D9;  // #1CBA90
            font-size: 15px;
            box-shadow: none;
            padding: 8px 0;
            font-weight: 700;
            border-radius: 6px;
        }
        button:hover{
            border-color: #0052D9;
            background: #ccdcf7;
        }
    }
    .text-blue-700{
        color: #333;
        background: #fff;
    }
    .bg-blue-50\/80{

    }
    .group:hover{
        background: #1f23291a;
    }
}
</style>