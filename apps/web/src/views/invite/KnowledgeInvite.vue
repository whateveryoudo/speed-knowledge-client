<template>
    <a-card v-if="!linkLosed" :title="false" class="mt-10 mx-auto w-[432px]">
        <a-flex v-if="invitationValidInfo.invitation.need_approval === 1" vertical gap="10" align="center"
            justify="center">
            <img :src="AvatarDef" alt="avatar" class="w-[48px] h-[48px]" />
            <p class="text-[var(--sd-grey-9)] mb-4">
                申请加入知识库
                <span class="text-[16px]">{{ invitationValidInfo.invitation.knowledge_name }}</span>
            </p>
            <a-button type="primary" @click="applyJoinKnowledge" :loading="loading" :disabled="waitApproval">{{
                waitApproval ? '已提交申请' : '申请加入' }}</a-button>
            <p class="my-4 text-[var(--sd-text-caption)]" v-if="waitApproval">等待管理员审核</p>
        </a-flex>
    </a-card>
    <not-found v-else title="邀请链接已失效" />
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import AvatarDef from '#sk-web/assets/images/avatar_def.png';
import { useRoute } from 'vue-router';
import { useInvite } from './hooks/useInvite';
import { CollaboratorResourceType } from '@sk/types';
const route = useRoute();

const options = computed(() => ({ token: route.query.token as string, teamSlug: route.params.team_slug as string, knowledgeSlug: route.params.knowledge_slug as string, resourceType: route.params.resource_type as CollaboratorResourceType }));
const { getInvitationValidLinkInfo, loading, linkLosed, invitationValidInfo, waitApproval, applyJoinKnowledge } = useInvite(options);
getInvitationValidLinkInfo();

</script>