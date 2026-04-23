<template>
    <a-flex justify="space-between" align="start"
        :class="['px-[16px] py-[12px] cursor-pointer transition-all duration-200 hover:bg-[var(--sd-grey-1)]', index !== 0 ? 'border border-t-1 border-t-solid border-t-[var(--sd-grey-2)]' : '']"
        :gap="12">
        <a-flex :gap="12" align="start">
            <a-avatar :src="item?.actor_user?.avatar || defaultAvatar" class="w-[32px] h-[32px]" />
            <a-flex vertical :gap="4">
                <a-space :size="8">
                    <span class="sender">{{ item?.actor_user?.nickname || item?.actor_user?.user_name }}</span>
                    <span>在文档中@了你</span>
                </a-space>
                <span class="time">{{ item?.created_at }}</span>
            </a-flex>
        </a-flex>

        <a-button type="default" size="small" @click="handleView(item)">
            查看
        </a-button>
    </a-flex>
</template>

<script setup lang="ts">
import type { NotificationItem } from '@sk/types';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';

const props = defineProps<{
    item: NotificationItem,
    index: number
}>()
const handleView = () => {

}
</script>