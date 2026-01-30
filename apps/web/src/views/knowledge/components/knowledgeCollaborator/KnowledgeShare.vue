<template>
    <a-popover trigger="click" @open-change="handleOpenChange" :overlayStyle="{ width: '440px' }"
        placement="bottomRight" :arrow="false">
        <template #content>
            <a-spin :spinning="resetLoading">
                <div class="p-2">
                    <div v-if="!showLinkPanel">
                        <p class="mb-4">当前知识库为私密，仅自己和协作者可访问</p>
                        <a-flex align="center" :gap="10" justify="space-between">
                            <a-flex align="center" :gap="10">
                                <span class="flex p-[9px] w-[40px] h-[40px] text-[#fff] bg-[#4b73b3] rounded-[8px]">
                                    <s-icon-font type="icon-invitate" svg-sprite />
                                </span>
                                <a-flex vertical>
                                    <p>通过链接邀请参与协作</p>
                                    <p class="text-[var(--sd-grey-7)] text-[12px]">通过链接，邀请对方加入协作</p>
                                </a-flex>
                            </a-flex>
                            <a-space>
                                <a-tooltip title="链接添加协作者">
                                    <a-button type="text" shape="circle" @click="showLinkPanel = true">
                                        <template #icon>
                                            <LinkOutlined />
                                        </template>
                                    </a-button>
                                </a-tooltip>
                                <a-tooltip title="查看所有协作者">
                                    <a-button type="text" shape="circle"
                                        @click="router.push(`/${team_slug}/knowledge/${knowledgeSlug}/manage/auth`)">
                                        <template #icon>
                                            <TeamOutlined />
                                        </template>
                                    </a-button>
                                </a-tooltip>
                            </a-space>
                        </a-flex>
                    </div>
                    <div :class="[secondModalType ? 'pt-0' : '', secondModalType === 'need_approval' && 'pb-0']"
                        v-if="secondModalType">
                        <div class="cursor-pointer flex gap-2 mb-4" @click="secondModalType = undefined">
                            <LeftOutlined style="font-size: 12px;" />
                            <span class="text-[16px] font-bold">{{ secondModalType === 'role' ? '协作权限' : '审批确认'
                                }}</span>
                        </div>
                        <p class="text-[var(--sd-grey-8)] mb-4">{{ secondModalType === 'role' ?
                            '可编辑，将拥有知识库的编辑权限。可阅读，仅拥有阅读和评论权限'
                            :
                            '开启后，需经过手动审批确认，获得链接的人才能成为协作者。' }}</p>
                        <a-flex vertical :gap="10" v-if="secondModalType === 'role'">
                            <div class="flex align-center justify-between cursor-pointer"
                                @click="handleUpdateTokenInfo({ 'role': CollaboratorRole.READ })">
                                <span>可阅读</span>
                                <check-outlined v-if="tokenInfo.role === CollaboratorRole.READ"
                                    style="color: #00b96b;" />
                            </div>
                            <div class="flex align-center justify-between cursor-pointer"
                                @click="handleUpdateTokenInfo({ 'role': CollaboratorRole.EDIT })">
                                <span>可编辑</span>
                                <check-outlined v-if="tokenInfo.role === CollaboratorRole.EDIT"
                                    style="color: #00b96b;" />
                            </div>
                        </a-flex>
                        <a-flex justify="space-between" align="center" v-if="secondModalType === 'need_approval'">
                            <span>提交申请后需审批确认</span>
                            <a-switch :checked="tokenInfo.need_approval === 1"
                                @change="(checked: boolean) => handleUpdateTokenInfo({ 'need_approval': checked ? 1 : 0 })" />
                        </a-flex>
                    </div>
                    <a-flex v-if="showLinkPanel && !secondModalType" vertical class="rounded-[8px]">
                        <div class="cursor-pointer flex gap-2" @click="showLinkPanel = false">
                            <LeftOutlined style="font-size: 12px;" />
                            <span class="text-[16px] font-bold">链接添加协作者</span>
                        </div>
                        <p class="my-4">拿到链接的人可获得阅读权限</p>
                        <a-flex vertical>
                            <a-flex align="center" :gap="10" class="mb-2">
                                <a-input class="flex-1" disabled :value="inviteUrl" :title="inviteUrl" />
                                <a-button class="shrink-0" @click="handleCopy()">复制链接</a-button>
                            </a-flex>
                            <a-flex vertical class="bg-[var(--sd-grey-1)] rounded-[8px] p-[6px]">
                                <div class="menu-item-base justify-between h-[40px]! hover:bg-[var(--sd-bg-primary-hover)]"
                                    @click="secondModalType = 'role'">
                                    <a-space class="text-[var(--sd-grey-9)]">
                                        <UsergroupAddOutlined />
                                        协作权限
                                    </a-space>
                                    <a-space>
                                        {{ tokenInfo.role === CollaboratorRole.READ ? '可阅读' : '可编辑' }}
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
                                <div class="menu-item-base justify-between h-[40px]! hover:bg-[var(--sd-red-1)]"
                                    align="center" @click="handleResetInvitationLink()">
                                    <a-space class="text-[var(--sd-red-6)]">
                                        <sync-outlined />
                                        重置邀请链接
                                    </a-space>
                                </div>
                            </a-flex>
                        </a-flex>
                    </a-flex>
                </div>
            </a-spin>
        </template>
        <a-button>分享</a-button>
    </a-popover>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { UsergroupAddOutlined, SyncOutlined, AuditOutlined, RightOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import { LinkOutlined, TeamOutlined } from '@ant-design/icons-vue';
import { useCollaborator } from '../../hooks/useCollaborator';
import { CollaboratorSource, CollaboratorRole } from '@sk/types';
import { useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const secondModalType = ref<'role' | 'need_approval'>();

const { tokenInfo, inviteUrl, handleCopy, resetLoading, getInvitationToken, handleUpdateTokenInfo, handleResetInvitationLink } = useCollaborator();
const showLinkPanel = ref(false);
const knowledgeSlug = computed(() => {
    return route.params.slug as string;
});
const team_slug = computed(() => {
    return route.params.team_slug as string;
});

const handleOpenChange = (val: boolean) => {
    if (val) {
        getInvitationToken()
    }
};
</script>