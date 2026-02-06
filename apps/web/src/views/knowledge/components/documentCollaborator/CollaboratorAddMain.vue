<template>
    <a-flex class="px-2" align="center" justify="space-between">
        <a-space class="cursor-pointer h-[40px] leading-[40px]" @click="handleBack">
            <LeftOutlined v-if="showBackIcon" style="font-size: 12px;" />
            <span class="text-[16px]">文档协作者</span>
        </a-space>
    </a-flex>
    <!-- 搜素人员：使用select,TODO:采用富文本模拟一个人员选择，不过感觉没必要，不用增加额外依赖 -->
    <div class="p-2">
        <PersonSearch class="mb-5" v-model:value="selectedUsers" />
        <!-- 显示已经添加的协作者列表 -->
        <div class="max-h-[500px] overflow-y-auto">
            <a-flex align="center" class="mb-2" justify="space-between" v-for="record in collaboratorList"
                :key="record.id">
                <template v-for="column in columns" :key="column.dataIndex">
                    <div v-if="column.dataIndex === 'user'" :style="{ width: column.width }">
                        <a-space :size="15">
                            <img :src="record.user.avatar || defaultAvatar" class="w-[25px] h-[25px]" />
                            <a-flex vertical>
                                <span class="truncate">{{ record.user.nickname }}<span
                                        class="ml-1 text-[var(--sd-text-caption)]" v-if="record.user.username">({{
                                            record.user.username }})</span></span>
                                <span v-if="record.status === CollaboratorStatus.PENDING">
                                    <span class="text-[var(--sd-text-caption)] text-[12px]">申请权限</span>
                                    <span class="ml-1">
                                        {{ formatRoleText(record.role) }}
                                    </span>
                                </span>

                                <!-- 如果是知识库协作者，则显示在知识库中的角色 -->
                                <span class="text-[12px]"
                                    v-if="record.target_type === CollaboratorResourceType.KNOWLEDGE">知识库{{
                                        formatRoleText(record.role) }}员</span>
                            </a-flex>
                        </a-space>
                    </div>
                    <template v-else-if="column.dataIndex === 'operation'">

                        <!-- 创建者无操作项 -->
                        <template v-if="record.status === CollaboratorStatus.PENDING">
                            <a-space>
                                <template #split>
                                    <a-divider type="vertical" class="mx-0" />
                                </template>
                                <span @click="handleAudit(record.id, 'agree', record.user)"
                                    class="cursor-pointer text-[var(--ant-color-primary)]">同意</span>
                                <span @click="handleAudit(record.id, 'reject', record.user)"
                                    class="cursor-pointer text-[var(--ant-color-error)]">拒绝</span>
                            </a-space>
                        </template>
                        <template v-else>
                            <span
                                v-if="record.source === CollaboratorSource.CREATOR || record.target_type === CollaboratorResourceType.KNOWLEDGE"
                                class="text-[var(--sd-text-caption)]">{{ formatRoleText(record.role)
                                }}</span>
                            <a-dropdown v-else trigger="click">
                                <template #overlay>
                                    <a-menu class="py-2!"
                                        @click="(e: any) => handleMenuClick(record.id, e.key as never)">
                                        <a-menu-item v-for="item in moreMenuOptions" :key="item.value">
                                            <a-flex vertical :gap="2">
                                                <span
                                                    :class="[(item as any).type === 'danger' ? 'text-[var(--sd-red-6)]' : '']">{{
                                                        item.label }}</span>
                                                <span class="text-[var(--sd-text-caption)]">{{ item.tip }}</span>
                                            </a-flex>
                                        </a-menu-item>
                                    </a-menu>
                                </template>
                                <a-space class="cursor-pointer ">
                                    {{ formatRoleText(record.role) }}
                                    <DownOutlined />
                                </a-space>
                            </a-dropdown>
                        </template>
                    </template>
                </template>
            </a-flex>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch, computed, inject } from 'vue';
import { LeftOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import PersonSearch from '#sk-web/components/personSearch/index.vue';
import { useCollaborator } from '../../hooks/useCollaborator';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { CollaboratorSource, CollaboratorRole, CollaboratorResourceType, DocumentCollaboratorRoleOptions, CollaboratorStatus } from '@sk/types';

const props = defineProps<{
    showBackIcon?: boolean
}>();
const emit = defineEmits<{
    (e: 'close'): void
}>();
const route = useRoute();

const selectedUsers = ref<number[]>([]);
const options = computed(() => ({
    resourceType: CollaboratorResourceType.DOCUMENT,
    documentSlug: route.params.document_slug as string,
    knowledgeSlug: route.params.knowledge_slug as string,
    teamSlug: route.params.team_slug as string,
}));
const { tokenInfo, inviteUrl, handleCopy, handleAudit, handleRoleChange, handleDelete, getCollaboratorList, collaboratorList, getInvitationToken, handleUpdateTokenInfo, handleResetInvitationLink } = useCollaborator(options);

const columns = ref([
    {
        title: '用户',
        dataIndex: 'user',
        width: '60%'
    },
    {
        title: '操作',
        dataIndex: 'operation'
    }
]);

const handleMenuClick = (collaboratorId: string, key: CollaboratorRole & 'delete') => {
    switch (key) {
        case 'role':
            handleRoleChange(collaboratorId, { role: key });
            break;
        case 'delete':
            handleDelete(collaboratorId);
            break;
    }
}
const moreMenuOptions = computed(() => [
    // 这里排除admin，文档不支持配置管理员
    ...DocumentCollaboratorRoleOptions.filter(item => item.value !== CollaboratorRole.ADMIN),
    {
        label: '移除',
        value: 'delete',
        type: 'danger',
        tip: '移除该协作者'
    },
]);
const formatRoleText = (role: CollaboratorRole) => {
    return DocumentCollaboratorRoleOptions.find(item => item.value === role)?.label ?? '--';
}
const handleBack = () => {
    if (props.showBackIcon) {
        emit('close');
    }
}
// 获取协作者列表
getCollaboratorList()

</script>

<style lang="less">
.collaborator-add-modal {
    .ant-modal-content {
        padding: 0;
    }
}
</style>