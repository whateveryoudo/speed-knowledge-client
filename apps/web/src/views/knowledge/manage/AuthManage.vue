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
        <a-table :columns="columns" row-key="id" :data-source="data" :row-selection="{
            selectedRowKeys,
            onChange: onSelectChange,
            getCheckboxProps: (record: KnowledgeCollaboratorResponse) => ({
                disabled: record.source === KnowledgeCollaboratorSource.CREATOR,
            })
        }" :pagination="false" :loading="collaboratorListLoading">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'user'">
                    <a-space :size="15">
                        <img :src="record.user.avatar || defaultAvatar" class="w-[25px] h-[25px]" />
                        <a-flex vertical :gap="2">
                            <span>{{ record.user.nickname }}</span>
                            <a-tag v-if="record.status === KnowledgeCollaboratorStatus.PENDING">申请加入</a-tag>
                            <span class="text-[var(--sd-text-caption)]">{{ record.user.username }}</span>
                        </a-flex>
                    </a-space>
                </template>
                <template v-else-if="column.dataIndex === 'role'">
                    <span v-if="record.source === KnowledgeCollaboratorSource.CREATOR">{{ formatRoleText(record.role)
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
                    <template v-if="record.source !== KnowledgeCollaboratorSource.CREATOR">
                        <a-space v-if="record.status === KnowledgeCollaboratorStatus.PENDING">
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
import { ref, h, reactive, inject, watch } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import CollaboratorAdd from './components/CollaboratorAdd.vue';
import { knowledge as knowledgeApi, knowLedgeInvite as knowLedgeInviteApi } from '@sk/api';
import { KNOWLEDGE_ID_KEY } from '#sk-web/context/keys';
import { to } from 'await-to-js';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { message } from 'ant-design-vue';
import { KnowledgeCollaboratorRoleOptions, KnowledgeCollaboratorSource, KnowledgeCollaboratorStatus, KnowledgeCollaboratorRole, type KnowledgeCollaboratorResponse } from '@sk/types';
import type { Key } from 'ant-design-vue/es/table/interface';
import type { UserInfo } from '@sk/types';
const value = ref(false);
const collaboratorAddVisible = ref(false);
const knowledgeId = inject(KNOWLEDGE_ID_KEY, ref('')); // 父级注入

const handleSearch = (value: string) => {
    console.log(value);
};
const collaboratorListLoading = ref(false);
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
const data = ref();
const selectedRowKeys = ref<Key[]>([]);
const onSelectChange = (selectedKeys: Key[]) => {
    selectedRowKeys.value = selectedKeys;
};
const handleDelete = async (id: string) => {
    const [err] = await to(knowLedgeInviteApi.deleteCollaborator(id));
    if (err) {
        return;
    }
    message.success('移除成功');
    getCollaboratorList(knowledgeId.value);
};
const handleRoleChange = async (id: string, info: Partial<KnowledgeCollaboratorResponse>) => {
    const [err] = await to(knowLedgeInviteApi.updateCollaboratorInfo(id, info));
    if (err) {
        return;
    }
    message.success('设置成功');
    getCollaboratorList(knowledgeId.value);
};
const formatRoleText = (role: KnowledgeCollaboratorRole) => {
    return KnowledgeCollaboratorRoleOptions.find(item => item.value === role)?.label ?? '--';
};
const handleAudit = async (id: string, audit_status: 'agree' | 'reject', user: UserInfo) => {
    const [err] = await to(knowLedgeInviteApi.auditCollaborator(id, { audit_status }));
    if (err) {
        return;
    }
    message.success(audit_status == 'agree' ? `已同意【${user.nickname}】加入` : `你拒绝了【${user.nickname}】加入`);
    getCollaboratorList(knowledgeId.value); // 列表刷新
};
const getCollaboratorList = async (knowledgeId: string) => {
    collaboratorListLoading.value = true;
    const [err, res] = await to(knowledgeApi.getCollaboratorList(knowledgeId));
    collaboratorListLoading.value = false;
    if (err) {
        return;
    }
    data.value = res.data;
};
watch(knowledgeId, (val: string) => {
    getCollaboratorList(val);
});
</script>