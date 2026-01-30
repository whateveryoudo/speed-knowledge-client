/**
 * 协作邀请管理（这里进行逻辑抽离，不同地方会使用, 知识库/文档）
 * 提供邀请链接、邀请信息、更新邀请信息、重置邀请链接等功能
 */
import { computed, ref } from 'vue';
import { type InvitationResponse, InvitationStatus, CollaboratorRole, CollaboratorResourceType } from '@sk/types';
import { useRoute } from 'vue-router';
import { collaborator as collaboratorApi } from '@sk/api';
import { to } from 'await-to-js';
import { message } from 'ant-design-vue';
import { useClipboard } from '@vueuse/core';
import { useToggle } from '@vueuse/core';
export const useCollaborator = () => {
    const [resetLoading, toggleResetLoading] = useToggle(false);
    const route = useRoute();
    const tokenInfo = ref<InvitationResponse>({
        token: '',
        status: InvitationStatus.ACTIVE,
        role: CollaboratorRole.READ,
        need_approval: 0,
        knowledge_id: '',
        document_id: '',
        id: '',
        created_at: '',
        updated_at: '',
    });

    const { copy } = useClipboard();
    const inviteUrl = computed(() => {
        return `${window.location.origin}/knowledge/${knowledgeSlug.value}/invite?token=${tokenInfo.value.token}`;
    });
    const knowledgeSlug = computed(() => {
        return route.params.slug as string;
    });
    const getInvitationToken = async () => {
        const [error, res] = await to(collaboratorApi.getInvitationToken(CollaboratorResourceType.KNOWLEDGE, knowledgeSlug.value));
        if (error) {
            return;
        }
        tokenInfo.value = res.data
    }
    // 更新当前邀请信息
    const handleUpdateTokenInfo = async (attrs: Partial<InvitationResponse>) => {
        const [error, res] = await to(collaboratorApi.updateInvitationToken(tokenInfo.value.id, attrs));
        if (error) {
            return;
        }
        message.success('操作成功');
        tokenInfo.value = res.data;
    }
    const handleResetInvitationLink = async () => {
        toggleResetLoading(true);
        const [error, res] = await to(collaboratorApi.resetInvitationLink(tokenInfo.value.id));
        if (error) {
            return;
        }
        tokenInfo.value = res.data;
        message.success('重置邀请链接成功');
        toggleResetLoading(false);
    }
    const handleCopy = () => {
        copy(inviteUrl.value);
        message.success('复制成功');
    }

    return {
        resetLoading,

        tokenInfo,
        inviteUrl,
        handleCopy,
        getInvitationToken,
        handleUpdateTokenInfo,
        handleResetInvitationLink,
    }
}