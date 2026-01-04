<template>
    <a-card v-if="!linkLosed" :title="false" class="mt-10 mx-auto w-[432px]">
        <a-flex vertical gap="10" align="center" justify="center">
            <img :src="AvatarDef" alt="avatar" class="w-[48px] h-[48px]" />
            <p class="text-[var(--sd-grey-9)] mb-4">申请加入知识库
                <span class="text-[16px]">{{ invitationValidInfo.invitation.knowledge_name }}</span>
            </p>
            <a-button type="primary" @click="applyJoinKnowledge" :loading="loading">申请加入</a-button>
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
    // 如果collaborator的status为ACCEPTED，则跳转到知识库页面
    if (invitationValidInfo.collaborator?.status === KnowledgeCollaboratorStatus.ACCEPTED) {
        router.push(`/knowledge/${knowledgeSlug.value}`);
    }
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
    // 如果collaborator的status为ACCEPTED，则跳转到知识库页面
    if (invitationValidInfo.collaborator?.status === KnowledgeCollaboratorStatus.ACCEPTED) {
        router.push(`/knowledge/${knowledgeSlug.value}`);
    }
};
</script>