<template>
    <a-flex class="px-2" align="center" justify="space-between">
        <a-space class="cursor-pointer h-[40px] leading-[40px]" @click="backToFirstModal">
            <LeftOutlined style="font-size: 12px;" />
            <span class="text-[16px]">文档协作者</span>
        </a-space>
    </a-flex>
    <!-- 搜素人员：使用select,TODO:采用富文本模拟一个人员选择，不过感觉没必要，不用增加额外依赖 -->
    <div class="p-2">
        <PersonSearch class="mb-5" v-model:value="selectedUsers" />
        <!-- 显示已经添加的协作者列表 -->
        <a-flex align="center" justify="space-between" v-for="record in collaboratorList" :key="record.id">
            <template v-for="column in columns" :key="column.dataIndex">
                <div v-if="column.dataIndex === 'user'" :style="{ width: column.width }">
                    <a-space :size="15">
                        <img :src="record.user.avatar || defaultAvatar" class="w-[25px] h-[25px]" />
                        <a-flex vertical :gap="2">
                            <span>{{ record.user.nickname }}</span>
                            <a-tag v-if="record.status === CollaboratorStatus.PENDING">申请加入</a-tag>
                            <span class="text-[var(--sd-text-caption)]">{{ record.user.username }}</span>
                        </a-flex>
                    </a-space>
                </div>
                <template v-else-if="column.dataIndex === 'operation'">

                    <!-- 创建者无操作项 -->
                    <template v-if="record.status === CollaboratorStatus.PENDING">
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" class="mx-1" />
                            </template>
                            <span @click="handleAudit(record.id, 'agree', record.user)"
                                class="cursor-pointer text-[var(--ant-color-primary)]">同意</span>
                            <span @click="handleAudit(record.id, 'reject', record.user)"
                                class="cursor-pointer text-[var(--ant-color-error)]">拒绝</span>
                        </a-space>
                    </template>
                    <template v-else>
                        <span v-if="record.source === CollaboratorSource.CREATOR">{{ formatRoleText(record.role)
                            }}</span>
                        <a-dropdown v-else trigger="click">
                            <template #overlay>
                                <a-menu class="py-2!" @click="(e: any) => handleMenuClick(record.id, e.key)">
                                    <a-menu-item v-for="item in moreMenuOptions" :key="item.value">
                                        <a-flex vertical :gap="2">
                                            <span>{{ item.label }}</span>
                                            <span class="text-[var(--sd-text-caption)]">{{ item.tip }}</span>
                                        </a-flex>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                            <a-space class="cursor-pointer">
                                {{ formatRoleText(record.role) }}
                                <DownOutlined />
                            </a-space>
                        </a-dropdown>
                    </template>
                </template>
            </template>
        </a-flex>
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
import { useToggle } from '@vueuse/core'
const route = useRoute();

const source = ref(CollaboratorSource.INVITATION);
const secondModalType = ref<'role' | 'need_approval'>();
const selectedUsers = ref<number[]>([]);
const options = computed(() => ({
    resourceType: CollaboratorResourceType.DOCUMENT,
    resourceSlug: route.params.document_slug as string,
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
    handleRoleChange(collaboratorId, { role: key });
}
const moreMenuOptions = computed(() => [
    ...DocumentCollaboratorRoleOptions,
    {
        label: '删除',
        value: 'delete',
        type: 'danger',
        tip: '移除该协作者'
    },
]);
const formatRoleText = (role: CollaboratorRole) => {
    return DocumentCollaboratorRoleOptions.find(item => item.value === role)?.label ?? '--';
}
const backToFirstModal = () => {
    secondModalType.value = undefined;
    getInvitationToken(); // 刷新邀请信息
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