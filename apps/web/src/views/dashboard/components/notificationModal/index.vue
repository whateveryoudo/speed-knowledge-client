<template>
    <s-full-modal height="80vh" class="notification-modal-wrapper" :open="visible" :footer="null" :title="null"
        :width="960" :mask-closable="true" :destroy-on-close="true" @cancel="handleCancel">
        <CloseOutlined
            class="absolute top-[18px] right-[10px] cursor-pointer transition-all text-[16px] duration-100 text-[var(--sd-text-caption)] hover:text-[var(--sd-text-primary)]"
            @click="handleCancel" />
        <a-flex class="h-full">
            <aside class="left-panel">
                <a-flex vertical class="h-full px-2">
                    <div class="text-[16px] py-6 px-5 shrink-0">消息中心</div>
                    <div class="px-2 flex-1 overflow-y-auto flex flex-col">
                        <template v-for="item in categoryItems" :key="item?.key">
                            <div :class="['menu-item-base justify-between hover:bg-[var(--sd-bg-primary-hover)]',
                                activeCategoryKey === item.key ? 'bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-primary)]! font-bold' : 'text-[var(--sd-text-caption)]']"
                                @click="activeCategoryKey = item.key">
                                <span class="truncate">{{ item.label }}</span>
                                <span v-if="item.count > 0" class="text-[12px]">{{ item.count
                                }}</span>
                            </div>
                        </template>
                    </div>

                </a-flex>
            </aside>

            <main class="right-panel">
                <a-flex vertical class="h-full">
                    <a-flex justify="space-between" align="center" class="py-2 pl-8 pr-10">
                        <ul class="flex gap-7 h-[40px] leading-[40px]">
                            <li :class="['cursor-pointer text-[var(--sd-text-body)] hover:text-[var(--sd-text-primary)] transition-all duration-200 border-solid border-0 border-b-2 border-b-transparent hover:border-b-[var(--sd-text-primary)]', activeTab === 'unread' ? 'text-[var(--sd-text-primary)] border-b-[var(--sd-text-primary)]!' : '']"
                                @click="activeTab = 'unread'">
                                未读
                            </li>
                            <li :class="['cursor-pointer text-[var(--sd-text-body)] hover:text-[var(--sd-text-primary)] transition-all duration-200 border-solid border-0 border-b-2 border-b-transparent hover:border-b-[var(--sd-text-primary)]', activeTab === 'read' ? 'text-[var(--sd-text-primary)] border-b-[var(--sd-text-primary)]!' : '']"
                                @click="activeTab = 'read'">
                                已读
                            </li>
                        </ul>
                        <a-button type="text" :disabled="currentListTypeUnreadCount === 0" size="small"
                            class="shadow-btn-wrapper" @click="handleAllRead">
                            <ClearOutlined />
                            全部已读
                        </a-button>
                    </a-flex>


                    <div class="list-wrap" @scroll="handleScroll">
                        <SkeletonList avatar :loading="initLoading" :count="10">
                            <div v-for="(item, index) in list" :key="item.id">
                                <component :is="getRenderComponent(item.biz_type)" :item="item" :index="index" />
                            </div>
                            <a-empty v-if="list.length === 0" description="暂无消息" />
                        </SkeletonList>
                        <div class="flex items-center justify-center py-1" v-if="loading && !noMore">
                            <a-spin />
                        </div>
                    </div>
                </a-flex>
            </main>
        </a-flex>
    </s-full-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { notification as notificationApi } from '@sk/api';
import MentionRender from './MentionRender.vue';
import { notificationBizTypeOptions, NotificationListType, NotificationBizType, type NotificationItem, type ReadUnreadType, type NotificationUnreadCountMap } from '@sk/types';
import { to } from 'await-to-js';
import { useLoadMore } from 'speed-components-ui-dev/debug/hooks'
import { CloseOutlined } from '@ant-design/icons-vue';
type CategoryKey = 'all' | NotificationListType;
type CategoryItem = {
    key: CategoryKey
    label: string
    count: number
}
const props = defineProps<{
    visible: boolean
}>()
const loadMoreOptions = computed(() => ({
    extraParams: {
        list_type: activeCategoryKey.value === 'all' ? '' : activeCategoryKey.value,
        type: activeTab.value,
    },
}))
const { list, loading, initLoading, noMore, initLoad, onLoadMore } = useLoadMore(notificationApi.getNotificationList, loadMoreOptions);

const unreadCountMap = ref<NotificationUnreadCountMap>({
    [NotificationListType.MENTION_OR_COMMENT]: 0,
    [NotificationListType.LIKE]: 0,
    [NotificationListType.FOLLOW]: 0,
    [NotificationListType.TODO]: 0,
    [NotificationListType.SYSTEM]: 0,
    [NotificationListType.OTHER]: 0,
})
const getUnreadCountMap = async () => {
    const [err, res] = await to(notificationApi.getAllUnreadCount());
    if (err) {
        return;
    }
    unreadCountMap.value = res.data;
}
// 不同类型的通知渲染组件
const getRenderComponent = (bizType: NotificationBizType) => {
    switch (bizType) {
        case NotificationBizType.MENTION:
            return MentionRender;
        default:
            return null;
    }
}
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'view', payload: NotificationItem): void
}>()
const activeCategoryKey = ref<CategoryKey>('all')
const activeTab = ref<'unread' | 'read'>('unread')
const currentListTypeUnreadCount = computed(() => {
    return unreadCountMap.value[activeCategoryKey.value as NotificationListType];
})
const categoryItems = computed<CategoryItem[]>(() => [
    { key: 'all', label: '全部消息', count: Object.values(unreadCountMap.value).reduce((acc, curr) => acc + curr, 0) },
    ...notificationBizTypeOptions.map((item) => ({
        key: item.value as CategoryKey,
        label: item.label,
        count: unreadCountMap.value[item.value as NotificationListType],
    })),
])
// 滚动加载更多（滚动到底部时触发）
const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (nearBottom && !noMore.value && !loading.value) {
        onLoadMore();
    }
};

const visible = computed(() => props.visible)


const handleCancel = () => {
    emit('update:visible', false)
}

const handleView = (item: NotificationItem) => {
    emit('view', item)
}
const handleAllRead = async () => {
    // const [err, res] = await to(notificationApi.markAllAsRead());
    // if (err) {
    //     return;
    // }
    // getAllUnreadCount();
}
// 获取未读通知数量
const getAllUnreadCount = async () => {
    const [err, res] = await to(notificationApi.getAllUnreadCount());
    if (err) {
        return;
    }
    unreadCountMap.value = res.data;
}
watch(() => props.visible, (newVal) => {
    if (newVal) {
        getAllUnreadCount();
        initLoad();
    }
}, {
    immediate: true,
})
</script>

<style lang="less">
.notification-modal-wrapper {
    .ant-modal-content {
        padding: 0;
    }
}



.left-panel {
    width: 170px;
    flex-shrink: 0;
    border-right: 1px solid var(--ant-color-border-secondary);
}

.panel-title {
    padding: 16px;
    font-weight: 600;
    color: var(--ant-color-text);
    border-bottom: 1px solid var(--ant-color-border-secondary);
}

.category-menu {
    border-inline-end: none;
    background: transparent;
}

.right-panel {
    flex: 1;
    min-width: 0;
    background: var(--ant-color-bg-container);
}

.top-tabs {
    padding: 0 16px;
    border-bottom: 1px solid var(--ant-color-border-secondary);
}

.list-wrap {
    flex: 1;
    overflow-y: auto;
}

.message-row {
    padding: 14px 16px;
}

.sender {
    font-weight: 600;
    color: var(--ant-color-text);
}

.content {
    color: var(--ant-color-text-secondary);
    line-height: 1.5;
}

.time {
    color: var(--ant-color-text-tertiary);
    font-size: 12px;
}
</style>