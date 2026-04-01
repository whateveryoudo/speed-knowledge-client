<template>
    <SkeletonList avatar  :class="['h-full', conversationsHistoryLoading ? 'flex p-4 flex-col gap-6' : '']" :count="3" :per-paragraph-rows="3" :loading="conversationsHistoryLoading">
        <div class="overflow-y-auto h-full" @scroll="handleScroll">
            <div v-if="conversationsHistory.length > 0" class="flex flex-col">
                <div @click="goToConversation(item.id)" v-for="(item, index) in conversationsHistory" :key="item.id" class="group relative flex items-center gap-3 px-[12px] py-[16px] transition-all cursor-pointer relative
                    border-b border-b-solid border-[rgba(0,0,0,0.08)]
                    "
                    :class="[activeConversationId === item.id
                        ? 'bg-blue-50/80 text-blue-700'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800', !conversationsHasMore && index === conversationsHistory.length - 1 ? 'border-b-0' : '']">
                    <!-- Active Indicator -->
                    <!-- <div v-if="activeConversationId === item.id"
                                class="absolute left-0 top-2 bottom-2 w-[3px] bg-blue-500 rounded-r-full"></div> -->

                    <!-- <MessageSquareIcon class="w-4 h-4 flex-shrink-0 opacity-60" /> -->
                    <div class="flex flex-col gap-3 w-full">
                        <div :title="item.title" class="text-[16px] truncate leading-tight font-medium">
                            {{ item.title }}
                        </div>
                        <a-flex class="w-full" :gap="6" align="center">
                            <img :src="RobotAvatar" class="w-[20px] h-auto" />
                            <span class="text-[14px] truncate  text-[var(--sd-text-caption)]">{{
                                item.last_message_preview
                                }}</span>
                        </a-flex>
                        <p class="text-[12px] text-[var(--sd-text-caption)]">{{
                            dayjs(item.created_at).format('YYYY-MM-DD HH:mm') }}</p>
                    </div>

                    <!-- 不显示时间，太占位置了 -->
                    <!-- <span class="text-[12px] opacity-50 font-medium flex-shrink-0">{{
                                getRecentTime(item.created_at)
                            }}</span> -->
                    <a-dropdown class="absolute right-[10px] top-[10px]" placement="bottomLeft" trigger="click"
                        @click="handleMoreClick(item)">
                        <span @click.stop
                            class="w-6 px-1 h-6 flex-shrink-0 group-hover:flex hidden items-center justify-center hover:bg-slate-200 rounded">
                            <MoreOutlined />
                        </span>
                        <template #overlay>
                            <a-menu>
                                <a-menu-item command="rename">重命名</a-menu-item>
                                <a-menu-item danger>删除</a-menu-item>
                            </a-menu>
                        </template>
                    </a-dropdown>


                </div>
                <div class="flex items-center justify-center py-1"
                    v-if="conversationsHistoryMoreLoading && conversationsHasMore">
                    <a-spin />
                </div>
            </div>
            <Empty0 v-else description="暂无历史记录" />
        </div>

    </SkeletonList>

</template>


<script setup lang="ts">
import { useChatSession } from '../composables/useChatSessionContext';
import type { ConversationItem } from '../composables/types';
import { MoreOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import RobotAvatar from '../../../assets/images/robot/robot-icon.svg';
const { conversationsHistory, displayHistory, activeConversationId, conversationsHistoryLoading, conversationsHistoryMoreLoading, conversationsHasMore, loadMoreConversationsHistory } = useChatSession();

// 加载会话历史
loadMoreConversationsHistory();

const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (nearBottom && conversationsHasMore.value && !conversationsHistoryLoading.value) {
        loadMoreConversationsHistory();
    }
};

const handleMoreClick = (item: ConversationItem) => {
    console.log(item);
};
// 跳转到会话消息
const goToConversation = (id: string) => {
    activeConversationId.value = id;
    displayHistory.value = false;
};
</script>