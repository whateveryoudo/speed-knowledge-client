<template>
    <s-full-modal height="80vh" class="notification-modal-wrapper" :open="visible" :footer="null" :title="null"
        :width="960" :mask-closable="true" :destroy-on-close="true" @cancel="handleCancel">
        <a-flex class="notification-modal" :gap="0">
            <aside class="left-panel">
                <a-flex vertical class="h-full">
                    <div class="text-[16px] p-6">消息中心</div>
                    <template v-for="item in categoryItems" :key="item?.key">
                    
                        <div
                            :class="['menu-item-base', activeTab === item.key ? 'bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-primary)]' : '']"
                            @click="activeTab = item.key">
                            <s-icon-font :iconRender="item.icon" class="text-[12px]" />
                            <span class="truncate">{{ item.label }}</span>
                        </div>
                    </template>
                </a-flex>
            </aside>

            <main class="right-panel">
                <a-flex vertical class="h-full">
                    <a-tabs v-model:activeKey="activeTab" class="top-tabs">
                        <a-tab-pane key="all" tab="全部" />
                        <a-tab-pane key="unread" tab="未读" />
                        <a-tab-pane key="read" tab="已读" />
                    </a-tabs>

                    <div class="list-wrap">
                        <a-list :data-source="displayList" :split="true">
                            <template #renderItem="{ item }">
                                <a-list-item class="message-row">
                                    <a-flex justify="space-between" align="start" class="w-full" :gap="12">
                                        <a-flex :gap="12" align="start">
                                            <a-avatar :style="{ backgroundColor: item.avatarColor }">
                                                {{ item.sender.slice(0, 1) }}
                                            </a-avatar>
                                            <a-flex vertical :gap="4">
                                                <a-space :size="8">
                                                    <span class="sender">{{ item.sender }}</span>
                                                    <a-tag v-if="!item.read" color="processing">未读</a-tag>
                                                </a-space>
                                                <div class="content">{{ item.content }}</div>
                                                <span class="time">{{ item.time }}</span>
                                            </a-flex>
                                        </a-flex>

                                        <a-button type="default" size="small" @click="handleView(item)">
                                            查看
                                        </a-button>
                                    </a-flex>
                                </a-list-item>
                            </template>
                        </a-list>

                        <a-empty v-if="displayList.length === 0" description="暂无消息" />
                    </div>
                </a-flex>
            </main>
        </a-flex>
    </s-full-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type NotificationItem = {
    id: string
    sender: string
    content: string
    time: string
    read: boolean
    type: 'all' | 'follow' | 'like' | 'mention' | 'todo' | 'system' | 'other'
    avatarColor: string
}

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'view', payload: NotificationItem): void
}>()

const activeTab = ref<'all' | 'unread' | 'read'>('all')
const selectedCategoryKeys = ref<string>(['all'])

const categoryItems = [
    { key: 'all', label: '全部消息' },
    { key: 'follow', label: '关注' },
    { key: 'like', label: '点赞' },
    { key: 'mention', label: '@ 和评论' },
    { key: 'todo', label: '待处理' },
    { key: 'system', label: '系统通知' },
    { key: 'other', label: '其他消息' },
]

const mockList = ref<NotificationItem[]>([
    {
        id: 'n-1',
        sender: '测试理解权限',
        content: '评论了文档 ykx测试文档2333112',
        time: '昨天 20:15',
        read: false,
        type: 'mention',
        avatarColor: 'var(--ant-color-primary)',
    },
    {
        id: 'n-2',
        sender: '你的文档',
        content: '无标题文档 公开分享即将在 1 天后到期，请及时查看处理。',
        time: '04-19 11:20',
        read: true,
        type: 'system',
        avatarColor: 'var(--ant-color-success)',
    },
    {
        id: 'n-3',
        sender: '测试理解权限',
        content: '申请访问文档 无标题111new',
        time: '02-03 19:37',
        read: false,
        type: 'todo',
        avatarColor: 'var(--ant-color-warning)',
    },
])

const visible = computed(() => props.visible)

const displayList = computed(() => {
    const category = selectedCategoryKeys.value[0] || 'all'
    let list = mockList.value

    if (category !== 'all') {
        list = list.filter((item) => item.type === category)
    }

    if (activeTab.value === 'unread') {
        list = list.filter((item) => !item.read)
    } else if (activeTab.value === 'read') {
        list = list.filter((item) => item.read)
    }

    return list
})

const handleCancel = () => {
    emit('update:visible', false)
}

const handleView = (item: NotificationItem) => {
    emit('view', item)
}
</script>

<style lang="less">
.notification-modal-wrapper {
    .ant-modal-content {
        padding: 0;
    }
}

.notification-modal {
    min-height: 560px;
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: 8px;
    overflow: hidden;
    background: var(--ant-color-bg-container);
}

.left-panel {
    width: 170px;
    border-right: 1px solid var(--ant-color-border-secondary);
    background: var(--ant-color-bg-layout);
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
    overflow: auto;
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