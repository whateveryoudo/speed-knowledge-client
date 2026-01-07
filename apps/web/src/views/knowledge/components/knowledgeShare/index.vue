<template>
    <a-popover trigger="click" placement="bottomRight" :arrow="false">
        <template #content>
            <p>当前知识库为私密，仅自己和协作者可访问</p>

            <a-flex align="center" :gap="10" class="mb-4">
                <span class="flex p-[9px] w-[40px] h-[40px] text-[#fff] bg-[#4b73b3] rounded-[8px]">
                    <s-icon-font type="icon-invitate" svg-sprite />
                </span>
                <a-flex vertical>
                    <p>通过链接邀请参与协作</p>
                    <p class="text-[var(--sd-grey-7)]">拿到链接的人可获得编辑、阅读等权限</p>
                </a-flex>
            </a-flex>
            <a-flex vertical class="bg-[var(--sd-grey-1)] rounded-[8px] p-[6px] pt-[16px]">
                <a-flex vertical>
                    <a-flex align="center" :gap="10" class="px-2 mb-2">
                        <a-input class="flex-1" disabled :value="inviteUrl" :title="inviteUrl" />
                        <a-button class="shrink-0" @click="handleCopy()">复制链接</a-button>
                    </a-flex>
                    <div class="menu-item-base justify-between h-[40px]! hover:bg-[var(--sd-bg-primary-hover)]"
                        @click="secondModalType = 'role'">
                        <a-space class="text-[var(--sd-grey-9)]">
                            <UsergroupAddOutlined />
                            协作权限
                        </a-space>
                        <a-space>
                            {{ tokenInfo.role === KnowledgeCollaboratorRole.READ ? '可阅读' : '可编辑' }}
                            <RightOutlined />
                        </a-space>
                    </div>
                    <div class="menu-item-base justify-between h-[40px]! hover:bg-[var(--sd-bg-primary-hover)]"
                        align="center" @click="secondModalType = 'need_approval'">
                        <a-space class="text-[var(--sd-grey-9)]">
                            <audit-outlined />
                            需要审批确认加入
                        </a-space>
                        <a-space>
                            {{ tokenInfo.need_approval === 1 ? '已开启' : '已关闭' }}
                            <RightOutlined />
                        </a-space>
                    </div>
                    <div class="menu-item-base justify-between h-[40px]! hover:bg-[var(--sd-red-1)]" align="center"
                        @click="handleResetInvitationLink()">
                        <a-space class="text-[var(--sd-red-6)]">
                            <sync-outlined />
                            重置邀请链接
                        </a-space>
                    </div>
                </a-flex>
            </a-flex>
        </template>
        <a-button>分享</a-button>
    </a-popover>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { CloseOutlined, UsergroupAddOutlined, SyncOutlined, AuditOutlined, RightOutlined } from '@ant-design/icons-vue';
import { to } from 'await-to-js'
import { useRoute } from 'vue-router';
import { knowLedgeInvite as knowLedgeInviteApi } from '@sk/api';
import { useClipboard } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { type KnowledgeInvitationResponse, type UserInfo, KnowledgeCollaboratorSource, KnowledgeInvitationStatus, KnowledgeCollaboratorRole } from '@sk/types';
const route = useRoute();
const props = defineProps<{
    visible: boolean;
}>();
const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
}>();
const source = ref(KnowledgeCollaboratorSource.INVITATION);
const secondModalType = ref<'role' | 'need_approval'>();
const selectedUsers = ref<number[]>([]);
const knowledgeSlug = computed(() => {
    return route.params.slug as string;
});
const tokenInfo = ref<KnowledgeInvitationResponse>({
    token: '',
    status: KnowledgeInvitationStatus.ACTIVE,
    role: KnowledgeCollaboratorRole.READ,
    need_approval: 0,
    knowledge_id: '',
    id: '',
    created_at: '',
    updated_at: '',
});
const inviteUrl = computed(() => {
    return `${window.location.origin}/knowledge/${knowledgeSlug.value}/invite?token=${tokenInfo.value.token}`;
});
const { copy } = useClipboard();
const open = ref(false);
const backToFirstModal = () => {
    secondModalType.value = undefined;
    getInvitationToken(); // 刷新邀请信息
}
const getInvitationToken = async () => {
    const [error, res] = await to(knowLedgeInviteApi.getInvitationToken(knowledgeSlug.value));
    if (error) {
        return;
    }
    tokenInfo.value = res.data
}
const handleCopy = async () => {
    await copy(inviteUrl.value);
    message.success('复制成功');
}
// 更新当前邀请信息
const handleUpdateTokenInfo = async (attrs: Partial<KnowledgeInvitationResponse>) => {
    const [error, res] = await to(knowLedgeInviteApi.updateInvitationToken(tokenInfo.value.id, attrs));
    if (error) {
        return;
    }
    message.success('操作成功');
    tokenInfo.value = res.data;
}
const handleResetInvitationLink = async () => {
    const [error, res] = await to(knowLedgeInviteApi.resetInvitationLink(tokenInfo.value.id));
    if (error) {
        return;
    }
    tokenInfo.value = res.data;
}
watch(() => props.visible, (val: boolean) => {
    // 获取协作者链接信息
    if (val) {
        getInvitationToken()
    }
}, {
    immediate: true,
});
</script>