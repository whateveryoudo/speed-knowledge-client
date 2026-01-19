/**
 * 知识库协作邀请管理（这里进行逻辑抽离，不同地方会使用）
 * 提供邀请链接、邀请信息、更新邀请信息、重置邀请链接等功能
 */
import { computed, ref } from 'vue';
import { type KnowledgeInvitationResponse, KnowledgeInvitationStatus, KnowledgeCollaboratorRole } from '@sk/types';
import { useRoute } from 'vue-router';
import { knowLedgeInvite as knowLedgeInviteApi } from '@sk/api';
import { to } from 'await-to-js';
import { message } from 'ant-design-vue';
import { useClipboard } from '@vueuse/core';
export const useKnowledgeCollaborator = () => {
    const route = useRoute();
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

    const { copy } = useClipboard();
    const inviteUrl = computed(() => {
        return `${window.location.origin}/knowledge/${knowledgeSlug.value}/invite?token=${tokenInfo.value.token}`;
    });
    const knowledgeSlug = computed(() => {
        return route.params.slug as string;
    });
    const getInvitationToken = async () => {
        const [error, res] = await to(knowLedgeInviteApi.getInvitationToken(knowledgeSlug.value));
        if (error) {
            return;
        }
        tokenInfo.value = res.data
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
    const handleCopy = () => {
        copy(inviteUrl.value);
        message.success('复制成功');
    }

    return {
        tokenInfo,
        inviteUrl,
        handleCopy,
        getInvitationToken,
        handleUpdateTokenInfo,
        handleResetInvitationLink,
    }
}