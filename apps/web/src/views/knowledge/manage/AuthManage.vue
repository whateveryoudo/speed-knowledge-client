<template>
    <a-flex vertical>
        <h3 class="mb-6 text-[var(--sd-text-primary)] text-[20px]">权限</h3>
        <h4 class="mb-4 text-[var(--sd-text-primary)] text-[16px]">公开性</h4>
        <a-radio-group class="mb-6" :value="isPublic" :disabled="!canManagePermission || publicToggling"
            @change="handlePublicChange">
            <a-radio :value="false" :style="radioStyle">
                <span>仅协作者可访问</span>
            </a-radio>
            <a-radio :value="true" :style="radioStyle">
                <a-flex align="center" :gap="8" class="inline-flex!">
                    <span>互联网所有人可访问</span>
                    <a-button v-if="isPublic" size="small" :disabled="!canManagePermission"
                        @click.stop="advancedOpen = true">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        高级设置
                    </a-button>
                </a-flex>
            </a-radio>
        </a-radio-group>
        <p v-if="!canManagePermission" class="mb-4 text-[13px] text-[var(--sd-text-caption)]">
            你没有修改知识库权限的能力，公开性只读展示。
        </p>
        <p v-if="isPublic && passwordProtected" class="mb-4 text-[13px] text-[var(--ant-color-warning)]">
            已开启密码保护，公开内容需输入密码访问；公开搜索暂不可用。
        </p>
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
        <CollaboratorAdd :visible="collaboratorAddVisible"
            @update:visible="(val: boolean) => collaboratorAddVisible = val" />
        <AuthAdvancedSettings v-model:open="advancedOpen" :knowledge-id="knowledgeId"
            :can-manage="canManagePermission" @password-change="passwordProtected = $event" />
    </a-flex>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { DeleteOutlined, DownOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { to } from 'await-to-js';
import CollaboratorAdd from '../components/knowledgeCollaborator/CollaboratorAdd.vue';
import AuthAdvancedSettings from './AuthAdvancedSettings.vue';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import {
    KnowledgeCollaboratorRoleOptions,
    CollaboratorSource,
    CollaboratorStatus,
    CollaboratorRole,
    KnowledgeAbility,
    type CollaboratorResponse,
    CollaboratorResourceType,
    type KnowledgeItem,
} from '@sk/types';
import type { Key } from 'ant-design-vue/es/table/interface';
import { useCollaborator } from '../hooks/useCollaborator';
import { knowledge as knowledgeApi, resource as resourceApi } from '@sk/api';

const collaboratorAddVisible = ref(false);
const advancedOpen = ref(false);
const publicToggling = ref(false);
const isPublic = ref(false);
const knowledgeId = ref('');
const passwordProtected = ref(false);
const route = useRoute();
const knowledgeSlug = computed(() => route.params.knowledge_slug as string);
const canManagePermission = computed(() => {
    return Boolean(knowledgeInfo.value.ability?.[KnowledgeAbility.MODIFY_BOOK_PERMISSION]);
});
const knowledgeInfo = ref<KnowledgeItem>({} as KnowledgeItem);
const options = computed(() => ({
    resourceType: CollaboratorResourceType.KNOWLEDGE,
    knowledgeSlug: knowledgeSlug.value,
    teamSlug: route.params.team_slug as string,
}));
const { collaboratorList, collaboratorListLoading, getCollaboratorList, handleAudit, handleDelete, handleRoleChange } = useCollaborator(options);

const loadKnowledge = async () => {
    const [err, res] = await to(knowledgeApi.getKnowledgeDetail(knowledgeSlug.value));
    if (err || !res?.data) return;
    knowledgeInfo.value = res.data;
    knowledgeId.value = res.data.id;
    isPublic.value = res.data.is_public;
    if (res.data.is_public && res.data.id) {
        const [, accessRes] = await to(
            resourceApi.getResourceAccessByTarget(CollaboratorResourceType.KNOWLEDGE, res.data.id),
        );
        passwordProtected.value = Boolean(accessRes?.data?.password);
    } else {
        passwordProtected.value = false;
    }
};

const handlePublicChange = async (e: { target: { value: boolean } }) => {
    if (!canManagePermission.value) return;
    const next = e.target.value;
    if (next === isPublic.value) return;
    publicToggling.value = true;
    const [err, res] = await to(knowledgeApi.toggleKnowledgePublic(knowledgeSlug.value));
    publicToggling.value = false;
    if (err) return;
    isPublic.value = res!.data;
    if (!isPublic.value) {
        advancedOpen.value = false;
    }
    message.success(isPublic.value ? '已设为互联网公开' : '已设为仅协作者可访问');
};

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

onMounted(() => {
    loadKnowledge();
    getCollaboratorList();
});

</script>
