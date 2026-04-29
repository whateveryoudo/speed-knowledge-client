<template>
    <a-flex justify="space-between" align="start"
        :class="['px-[16px] py-[12px] cursor-pointer transition-all duration-200 hover:bg-[var(--sd-grey-1)]', index !== 0 ? 'border border-t-1 border-t-solid border-t-[var(--sd-grey-2)]' : '']"
        :gap="12">
        <a-flex :gap="12" align="start">
            <a-avatar :src="item?.actor_user?.avatar || defaultAvatar" class="w-[32px] h-[32px]" />
            <a-flex vertical :gap="4">
                <a-space :size="8">
                    <span class="sender">{{ item?.actor_user?.nickname || item?.actor_user?.user_name }}</span>
                    <span>在&nbsp;{{ item?.payload?.document_route?.document_name }}&nbsp;中@了你</span>
                </a-space>
                <span class="time">{{ transformDatatimeToRecentText(item?.created_at) }}</span>
            </a-flex>
        </a-flex>

        <a-button type="default" size="small" @click="handleView()">
            查看
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import type { NotificationItem } from '@sk/types';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { transformDatatimeToRecentText } from '@sk/utils';
import { CollaboratorResourceType } from '@sk/types';
import { useRouter } from 'vue-router';
import { buildDocumentRouterUrl } from '@sk/utils';
const router = useRouter();
const props = defineProps<{
    item: NotificationItem,
    index: number
}>()
const emit = defineEmits<{
    (e: 'change-read-status', id: string): void
}>();
const handleView = () => {
    // 跳转文档详情
    const routeContext = props.item?.payload?.document_route;
    if (routeContext) {
        router.push(buildDocumentRouterUrl(routeContext));
        emit('change-read-status', props.item?.id);
    }
}
</script>