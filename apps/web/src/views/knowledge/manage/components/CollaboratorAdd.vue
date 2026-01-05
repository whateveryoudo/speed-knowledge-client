<template>
    <s-full-modal class="collaborator-add-modal" :footer="false" :visible="visible"
        @update:visible="(val: boolean) => emit('update:visible', val)">
        <template #title>
            <a-flex
                :class="['px-4 pt-2 border-solid border-0 border-b-1 border-b-[var(--sd-grey-2)]', secondModalType ? 'border-b-0' : '']"
                align="center" justify="space-between">
                <ul v-if="!secondModalType" class="flex gap-6 h-[40px] leading-[40px]">
                    <li :class="['cursor-pointer text-[var(--sd-text-body)] hover:text-[var(--sd-text-primary)] transition-all duration-200 border-solid border-0 border-b-2 border-b-transparent hover:border-b-[var(--sd-text-primary)]', source === 1 ? 'text-[var(--sd-text-primary)] border-b-[var(--sd-text-primary)]!' : '']"
                        @click="source = KnowledgeCollaboratorSource.INVITATION">
                        邀请添加
                    </li>
                    <li :class="['cursor-pointer text-[var(--sd-text-body)] hover:text-[var(--sd-text-primary)] transition-all duration-200 border-solid border-0 border-b-2 border-b-transparent hover:border-b-[var(--sd-text-primary)]', source === 2 ? 'text-[var(--sd-text-primary)] border-b-[var(--sd-text-primary)]!' : '']"
                        @click="source = KnowledgeCollaboratorSource.SEARCH_JOIN">
                        搜索添加
                    </li>
                </ul>
                <a-space v-else class="cursor-pointer h-[40px] leading-[40px]" @click="backToFirstModal">
                    <LeftOutlined style="font-size: 12px;" />
                    <span class="text-[16px]">{{ secondModalType === 'role' ? '协作权限' : '审批确认' }}</span>
                </a-space>
                <CloseOutlined
                    class="cursor-pointer text-[var(--sd-text-caption)] hover:text-[var(--sd-text-primary)] transition-[color] duration-200"
                    @click="emit('update:visible', false)" />
            </a-flex>
        </template>
        <div :class="['p-4', secondModalType ? 'pt-0' : '', secondModalType === 'need_approval' && 'pb-0']"
            v-if="source === KnowledgeCollaboratorSource.INVITATION">
            <div v-if="secondModalType">
                <p class="text-[var(--sd-grey-8)] mb-4">{{ secondModalType === 'role' ? '可编辑，将拥有知识库的编辑权限。可阅读，仅拥有阅读和评论权限'
                    :
                    '开启后，需经过手动审批确认，获得链接的人才能成为协作者。' }}</p>

                <a-flex vertical :gap="10" v-if="secondModalType === 'role'">
                    <div class="flex align-center justify-between cursor-pointer"
                        @click="handleUpdateTokenInfo({ 'role': KnowledgeCollaboratorRole.READ })">
                        <span>可阅读</span>
                        <check-outlined v-if="tokenInfo.role === KnowledgeCollaboratorRole.READ"
                            style="color: #00b96b;" />
                    </div>
                    <div class="flex align-center justify-between cursor-pointer"
                        @click="handleUpdateTokenInfo({ 'role': KnowledgeCollaboratorRole.EDIT })">
                        <span>可编辑</span>
                        <check-outlined v-if="tokenInfo.role === KnowledgeCollaboratorRole.EDIT"
                            style="color: #00b96b;" />
                    </div>
                </a-flex>
                <a-flex justify="space-between" align="center" v-if="secondModalType === 'need_approval'">
                    <span>提交申请后需审批确认</span>
                    <a-switch :checked="tokenInfo.need_approval === 1"
                        @change="(checked: boolean) => handleUpdateTokenInfo({ 'need_approval': checked ? 1 : 0 })" />
                </a-flex>

            </div>
            <template v-else>
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
        </div>
        <!-- 链接邀请，二级编辑页面 -->

        <!-- 搜素人员：使用select,TODO:采用富文本模拟一个人员选择，不过感觉没必要，不用增加额外依赖 -->
        <div v-else class="p-4">
            <PersonSearch class="mb-10" v-model:value="selectedUsers" />
            <a-flex align="center" justify="space-between">
                <a-space class="text-[var(--sd-text-caption)]">
                    <span>已选择 {{ selectedUsers.length }} 个</span>
                    <span>
                        权限:
                        <a-dropdown placement="top" v-model:open="open">
                            <a-button class="px-2 text-[var(--sd-text-caption)]" type="text" @click.prevent>
                                可编辑
                                <UpOutlined v-if="open" />
                                <DownOutlined v-else />
                            </a-button>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        可编辑
                                    </a-menu-item>
                                    <a-menu-item>
                                        可阅读
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </span>
                </a-space>
                <a-button type="primary" :disabled="selectedUsers.length === 0">添加</a-button>
            </a-flex>
        </div>
    </s-full-modal>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { CloseOutlined, UsergroupAddOutlined, SyncOutlined, AuditOutlined, RightOutlined } from '@ant-design/icons-vue';
import { to } from 'await-to-js'
import { useRoute } from 'vue-router';
import { knowLedgeInvite as knowLedgeInviteApi } from '@sk/api';
import { useClipboard } from '@vueuse/core';
import { message } from 'ant-design-vue';
import PersonSearch from '#sk-web/components/personSearch/index.vue';
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

<style lang="less">
.collaborator-add-modal {
    .ant-modal-content {
        padding: 0;
    }
}
</style>