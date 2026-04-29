<template>
    <a-flex justify="space-between" align="start"
        :class="['px-[16px] py-[12px] cursor-pointer transition-all duration-200 hover:bg-[var(--sd-grey-1)]', index !== 0 ? 'border border-t-1 border-t-solid border-t-[var(--sd-grey-2)]' : '']"
        :gap="12">
        <a-flex :gap="12" align="start">
            <a-avatar :src="item?.actor_user?.avatar || defaultAvatar" class="w-[32px] h-[32px]" />
            <a-flex vertical :gap="4" v-if="CollaboratorStatus.PENDING === item?.payload?.collaborator?.status">
                <a-space :size="8">
                    <span class="sender">{{ item?.actor_user?.nickname || item?.actor_user?.user_name }}</span>
                    <span>申请访问知识库</span>
                    <span>{{ item?.payload?.knowledge_route?.knowledge_name }}</span>
                </a-space>
                <span class="time">{{ transformDatatimeToRecentText(item?.created_at) }}</span>
            </a-flex>
            <a-flex vertical :gap="4" v-else>
                <p class="text-[var(--sd-text-caption)]">相关内容已删除</p>
                <span class="time">{{ transformDatatimeToRecentText(item?.created_at) }}</span>
            </a-flex>
        </a-flex>

        <a-button type="default" size="small" @click="handleView()" v-if="CollaboratorStatus.PENDING === item?.payload?.collaborator?.status">
            查看
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import type { NotificationItem } from '@sk/types';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { transformDatatimeToRecentText } from '@sk/utils';
import { buildKnowledgeRouterUrl, buildDocumentRouterUrl } from '@sk/utils';
import { CollaboratorResourceType, CollaboratorStatus } from '@sk/types';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps<{
    item: NotificationItem,
    index: number
}>()
const emit = defineEmits<{
    (e: 'change-read-status', id: string): void
}>();
const handleView = () => {
    let routeContext = {};
    if (props.item?.payload?.collaborator?.target_type === CollaboratorResourceType.KNOWLEDGE) {
        // 跳转知识库授权页面
        routeContext = props.item?.payload?.knowledge_route;
        const routeUrl = router.resolve({
            path: buildKnowledgeRouterUrl(routeContext) + '/manage/auth',
        });
        if (routeUrl) {
            window.open(routeUrl.href, '_blank');
            // 如果当前消息为未读，则需要更新为已读
            if (!props.item?.read_at) {
                emit('change-read-status', props.item?.id);
            }
        }
    } else {
        // 跳转文档详情
        routeContext = props.item?.payload?.document_route;
        if (routeContext) {
            router.push(buildDocumentRouterUrl(routeContext));
        }
    }
}
</script>