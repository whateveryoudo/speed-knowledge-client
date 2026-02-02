<template>
    <a-flex vertical>
        <h3 class="mb-6 text-[var(--sd-text-primary)] text-[20px]">权限</h3>
        <h4 class="mb-4 text-[var(--sd-text-primary)] text-[16px]">公开性</h4>
        <a-radio-group class="mb-6" v-model:value="value">
            <a-radio :value="false" :style="radioStyle">
                <span>仅协作者可访问</span>
            </a-radio>
            <a-radio :value="true" disabled :style="radioStyle">
                <span>互联网所有人可访问</span>
            </a-radio>
        </a-radio-group>
        <a-flex justify="space-between" align="center" class="mb-4">
            <span class="text-[16px]">协作者</span>
            <a-space>
                <FlexSearch @change="handleSearch" />
                <a-button @click="collaboratorAddVisible = true">添加</a-button>
            </a-space>
        </a-flex>
        <a-table :columns="columns" row-key="id" :data-source="collaboratorList" :row-selection="{
            selectedRowKeys,
            onChange: onSelectChange,
            getCheckboxProps: (record: CollaboratorResponse) => ({
                disabled: record.source === CollaboratorSource.CREATOR,
            })
        }" :pagination="false" :loading="collaboratorListLoading">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'user'">
                    <a-space :size="15">
                        <img :src="record.user.avatar || defaultAvatar" class="w-[25px] h-[25px]" />
                        <a-flex vertical :gap="2">
                            <span>{{ record.user.nickname }}</span>
                            <a-tag v-if="record.status === CollaboratorStatus.PENDING">申请加入</a-tag>
                            <span class="text-[var(--sd-text-caption)]">{{ record.user.username }}</span>
                        </a-flex>
                    </a-space>
                </template>
                <template v-else-if="column.dataIndex === 'role'">
                    <span v-if="record.source === CollaboratorSource.CREATOR">{{ formatRoleText(record.role)
                        }}</span>
                    <a-dropdown v-else trigger="click">
                        <template #overlay>
                            <a-menu class="py-2!" @click="(e: any) => handleRoleChange(record.id, { role: e.key })">
                                <a-menu-item v-for="item in KnowledgeCollaboratorRoleOptions" :key="item.value">
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
                <template v-else-if="column.dataIndex === 'operation'">
                    <!-- 创建者无操作项 -->
                    <template v-if="record.source !== CollaboratorSource.CREATOR">
                        <a-space v-if="record.status === CollaboratorStatus.PENDING">
                            <a-space>
                                <template #split>
                                    <a-divider type="vertical" class="mx-1" />
                                </template>
                                <span @click="handleAudit(record.id, 'agree', record.user)"
                                    class="cursor-pointer text-[var(--ant-color-primary)]">同意</span>
                                <span @click="handleAudit(record.id, 'reject', record.user)"
                                    class="cursor-pointer text-[var(--ant-color-error)]">拒绝</span>
                            </a-space>
                        </a-space>
                        <a-space v-else>
                            <DeleteOutlined @click="handleDelete(record.id)" class="cursor-pointer" />
                        </a-space>
                    </template>
                </template>
            </template>
        </a-table>
        <!-- 添加协作者弹窗 -->
        <CollaboratorAdd :visible="collaboratorAddVisible"
            @update:visible="(val: boolean) => collaboratorAddVisible = val" />
    </a-flex>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import CollaboratorAdd from '../components/knowledgeCollaborator/CollaboratorAdd.vue';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { KnowledgeCollaboratorRoleOptions, CollaboratorSource, CollaboratorStatus, CollaboratorRole, type CollaboratorResponse, CollaboratorResourceType } from '@sk/types';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useCollaborator } from '../hooks/useCollaborator';
const value = ref(false);
const collaboratorAddVisible = ref(false);
const route = useRoute();
const options = computed(() => ({
    resourceType: CollaboratorResourceType.KNOWLEDGE,
    resourceSlug: route.params.knowledge_slug as string,
    teamSlug: route.params.team_slug as string,
}));
const { collaboratorList, collaboratorListLoading, getCollaboratorList, handleAudit, handleDelete, handleRoleChange } = useCollaborator(options);
const handleSearch = (value: string) => {
    console.log(value);
};
const columns = ref([
    {
        title: '用户',
        dataIndex: 'user',
    },
    {
        title: '权限',
        dataIndex: 'role',
    },
    {
        title: '操作',
        dataIndex: 'operation'
    }
]);
const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
});
const selectedRowKeys = ref<Key[]>([]);
const onSelectChange = (selectedKeys: Key[]) => {
    selectedRowKeys.value = selectedKeys;
};
const formatRoleText = (role: CollaboratorRole) => {
    return KnowledgeCollaboratorRoleOptions.find(item => item.value === role)?.label ?? '--';
};
getCollaboratorList();

</script>