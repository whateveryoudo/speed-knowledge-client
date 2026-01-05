<template>
    <a-card v-if="!linkLosed" :title="false" class="mt-10 mx-auto w-[432px]">
        <a-flex vertical gap="10" align="center" justify="center">
            <img :src="AvatarDef" alt="avatar" class="w-[48px] h-[48px]" />
            <p class="text-[var(--sd-grey-9)] mb-4">申请加入知识库
                <span class="text-[16px]">{{ invitationValidInfo.invitation.knowledge_name }}</span>
            </p>
            <a-button type="primary" @click="applyJoinKnowledge" :loading="loading" :disabled="waitApproval">{{ waitApproval ? '已提交申请' : '申请加入' }}</a-button>
            <p class="my-4 text-[var(--sd-text-caption)]" v-if="waitApproval">等待管理员审核</p>
        </a-flex>
    </a-card>
    <not-found v-else title="邀请链接已失效"/>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import AvatarDef from '#sk-web/assets/images/avatar_def.png';
import { useRoute, useRouter } from 'vue-router';
import { to } from 'await-to-js';
import { knowLedgeInvite as knowledgeInviteApi } from '@sk/api';
import { message } from 'ant-design-vue';
import { type KnowledgeInvitationValidInfo, KnowledgeInvitationStatus, KnowledgeCollaboratorStatus } from '@sk/types';
const route = useRoute();
const router = useRouter();
const token = computed(() => route.query.token as string);
const knowledgeSlug = computed(() => route.params.slug as string);
const loading = ref(false);
const linkLosed = ref(false);
const invitationValidInfo = reactive<KnowledgeInvitationValidInfo>({
    invitation: {
        status: KnowledgeInvitationStatus.ACTIVE,
        knowledge_name: '',
        knowledge_id: '',
    },
    collaborator: null
});
const waitApproval = ref(false);
// 获取状态统一处理
const handleInvitationValidInfo = () => {
    if (invitationValidInfo.collaborator?.status === KnowledgeCollaboratorStatus.ACCEPTED) {
        router.push(`/knowledge/${knowledgeSlug.value}`);
    } else if (invitationValidInfo.collaborator?.status === KnowledgeCollaboratorStatus.PENDING) {
        message.info('你已提交申请');
        waitApproval.value = true;
    }
};
const getInvitationValidLinkInfo = async (token: string) => {
    const [error, res] = await to(knowledgeInviteApi.getInvitationValidLinkInfo(token));
    if (error) {
        if ((error as any).response.data.errCode === 400) {
            linkLosed.value = true;
        } 
        return;
    }
    invitationValidInfo.invitation = res.data.invitation;
    invitationValidInfo.collaborator = res.data.collaborator;
    handleInvitationValidInfo();
};
getInvitationValidLinkInfo(token.value);
const applyJoinKnowledge = async () => {
    if (invitationValidInfo.collaborator) {
        return;
    }
    loading.value = true;
    const [error, res] = await to(knowledgeInviteApi.applyJoinKnowledge({ invitation_token: token.value }));
    loading.value = false;
    if (error) {
        return;
    }
    invitationValidInfo.collaborator = res.data;
    handleInvitationValidInfo();
};
</script>