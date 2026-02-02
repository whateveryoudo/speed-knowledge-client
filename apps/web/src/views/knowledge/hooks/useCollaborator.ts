/**
 * 协作邀请管理（这里进行逻辑抽离，不同地方会使用, 知识库/文档）
 * 提供 获取协作者列表，审批，移除，角色修改， 邀请链接、邀请信息、更新邀请信息、重置邀请链接等功能
 */
import { computed, ref, type ComputedRef } from 'vue';
import { type InvitationResponse, InvitationStatus, CollaboratorRole, type UserInfo, CollaboratorResourceType, type CollaboratorResponse } from '@sk/types';
import { collaborator as collaboratorApi } from '@sk/api';
import { to } from 'await-to-js';
import { message } from 'ant-design-vue';
import { useClipboard } from '@vueuse/core';
import { useToggle } from '@vueuse/core';
interface IOptions {
    resourceType: CollaboratorResourceType;
    resourceSlug: string;
    teamSlug: string;
}
export const useCollaborator = (options: ComputedRef<IOptions>) => {
    const [collaboratorListLoading, toggleCollaboratorListLoading] = useToggle(false);
    const [resetLoading, toggleResetLoading] = useToggle(false);
    const { resourceType, resourceSlug, teamSlug } = options.value;
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
    const collaboratorList = ref<CollaboratorResponse[]>([]);
    const { copy } = useClipboard();
    const inviteUrl = computed(() => {
        return `${window.location.origin}/${teamSlug}/${resourceType}/${resourceSlug}/invite?token=${tokenInfo.value.token}`;
    });


    const getInvitationToken = async () => {
        const [error, res] = await to(collaboratorApi.getInvitationToken(resourceType, resourceSlug));
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
    const handleDelete = async (id: string) => {
        const [err] = await to(collaboratorApi.deleteCollaborator(id));
        if (err) {
            return;
        }
        message.success('移除成功');
        getCollaboratorList();
    };
    const handleAudit = async (id: string, audit_status: 'agree' | 'reject', user: UserInfo) => {
        const [err] = await to(collaboratorApi.auditCollaborator(id, { audit_status }));
        if (err) {
            return;
        }
        message.success(audit_status == 'agree' ? `已同意【${user.nickname}】加入` : `你拒绝了【${user.nickname}】加入`);
        getCollaboratorList(); // 列表刷新
    };
    const handleRoleChange = async (id: string, info: Partial<CollaboratorResponse>) => {
        const [err] = await to(collaboratorApi.updateCollaboratorInfo(id, info));
        if (err) {
            return;
        }
        message.success('设置成功');
        getCollaboratorList();
    };

    const getCollaboratorList = async () => {
        toggleCollaboratorListLoading(true);
        const [err, res] = await to(collaboratorApi.getCollaboratorList(resourceType, resourceSlug));
        toggleCollaboratorListLoading(false);
        if (err) {
            return;
        }
        collaboratorList.value = res.data;
    };

    return {
        resetLoading,
        collaboratorListLoading,
        collaboratorList,
        tokenInfo,
        inviteUrl,
        handleCopy,
        getInvitationToken,
        handleUpdateTokenInfo,
        handleResetInvitationLink,


        getCollaboratorList,
        handleDelete,
        handleAudit,
        handleRoleChange,
    }
}