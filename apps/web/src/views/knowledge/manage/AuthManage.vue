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
                <a-tooltip title="邀请协作稍后接入 V2">
                    <a-button disabled>添加</a-button>
                </a-tooltip>
            </a-space>
        </a-flex>
        <a-table :columns="columns" :row-key="rowKey" :data-source="collaborationList" :pagination="false"
            :loading="listLoading">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'user'">
                    <a-space v-if="record.row_type === 'role_group'" :size="15">
                        <a-flex vertical :gap="2">
                            <span>{{ record.display_name }}</span>
                            <span class="text-[var(--sd-text-caption)]">角色组</span>
                        </a-flex>
                    </a-space>
                    <a-space v-else :size="15">
                        <img :src="record.user?.avatar || defaultAvatar" class="w-[25px] h-[25px]" />
                        <a-flex vertical :gap="2">
                            <span>{{ record.user?.nickname || record.display_name }}</span>
                            <a-tag v-if="record.status === 'pending'">申请加入</a-tag>
                            <span class="text-[var(--sd-text-caption)]">{{ record.user?.username }}</span>
                        </a-flex>
                    </a-space>
                </template>
                <template v-else-if="column.dataIndex === 'role'">
                    <span v-if="record.locked || !record.can_manage">{{ formatRoleText(record.resource_role) }}</span>
                    <a-tooltip v-else title="改角色稍后接入 V2">
                        <a-space class="cursor-not-allowed opacity-70">
                            {{ formatRoleText(record.resource_role) }}
                            <DownOutlined />
                        </a-space>
                    </a-tooltip>
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                    <template v-if="!record.locked && record.can_manage">
                        <a-tooltip title="审批/移除稍后接入 V2">
                            <span class="text-[var(--sd-text-caption)] cursor-not-allowed">—</span>
                        </a-tooltip>
                    </template>
                </template>
            </template>
        </a-table>
        <AuthAdvancedSettings v-model:open="advancedOpen" :knowledge-id="knowledgeId" :can-manage="canManagePermission"
            @password-change="passwordProtected = $event" />
    </a-flex>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { DownOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { to } from 'await-to-js';
import AuthAdvancedSettings from './AuthAdvancedSettings.vue';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import {
    ResourceRole,
    ResourceRoleOptions,
    KnowledgeAbility,
    KnowledgeVisibility,
    CollaboratorResourceType,
    type KnowledgeItem,
    type ResourceCollaborationItem,
} from '@sk/types';
import { knowledge as knowledgeApi, resource as resourceApi, resourceCollaboration as collaborationApi } from '@sk/api';
import { useToggle } from '@vueuse/core';

const advancedOpen = ref(false);
const publicToggling = ref(false);
const isPublic = ref(false);
const knowledgeId = ref('');
const passwordProtected = ref(false);
const collaborationList = ref<ResourceCollaborationItem[]>([]);
const [listLoading, toggleListLoading] = useToggle(false);
const searchKeyword = ref('');
const route = useRoute();
const knowledgeSlug = computed(() => route.params.knowledge_slug as string);
const canManagePermission = computed(() => {
    return Boolean(knowledgeInfo.value.ability?.[KnowledgeAbility.MODIFY_BOOK_PERMISSION]);
});
const knowledgeInfo = ref<KnowledgeItem>({} as KnowledgeItem);

const rowKey = (record: ResourceCollaborationItem) => {
    return (
        record.grant_id ||
        record.access_request_id ||
        `${record.row_type}-${record.principal_type}-${record.principal_id}-${record.principal_role}`
    );
};

const loadCollaborationList = async () => {
    if (!knowledgeId.value) return;
    toggleListLoading(true);
    const [err, res] = await to(
        collaborationApi.listKnowledgeCollaborations(knowledgeId.value, {
            keyword: searchKeyword.value || undefined,
        }),
    );
    toggleListLoading(false);
    if (err || !res?.data) return;
    collaborationList.value = res.data;
};

const loadKnowledge = async () => {
    const [err, res] = await to(knowledgeApi.getKnowledgeDetail(knowledgeSlug.value));
    if (err || !res?.data) return;
    knowledgeInfo.value = res.data;
    knowledgeId.value = res.data.id;
    isPublic.value = res.data.visibility === KnowledgeVisibility.PUBLIC;
    if (isPublic.value && res.data.id) {
        const [, accessRes] = await to(
            resourceApi.getResourceAccessByTarget(CollaboratorResourceType.KNOWLEDGE, res.data.id),
        );
        passwordProtected.value = Boolean(accessRes?.data?.password);
    } else {
        passwordProtected.value = false;
    }
    await loadCollaborationList();
};

const handlePublicChange = async (e: { target: { value: boolean } }) => {
    if (!canManagePermission.value) return;
    const next = e.target.value;
    if (next === isPublic.value) return;
    publicToggling.value = true;
    const visibility = next ? KnowledgeVisibility.PUBLIC : KnowledgeVisibility.PRIVATE;
    const [err] = await to(
        knowledgeApi.updateKnowledgeVisibility(knowledgeSlug.value, visibility),
    );
    publicToggling.value = false;
    if (err) return;
    isPublic.value = next;
    knowledgeInfo.value.visibility = visibility;
    if (!isPublic.value) {
        advancedOpen.value = false;
        passwordProtected.value = false;
    }
    message.success(isPublic.value ? '已设为互联网公开' : '已设为仅协作者可访问');
};

const handleSearch = (value: string) => {
    searchKeyword.value = value?.trim() || '';
    loadCollaborationList();
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
        dataIndex: 'operation',
    },
]);
const radioStyle = reactive({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
});
const formatRoleText = (role?: ResourceRole | null) => {
    if (!role || role === ResourceRole.NONE) return '无权限';
    return ResourceRoleOptions.find((item) => item.value === role)?.label ?? '--';
};

onMounted(() => {
    loadKnowledge();
});
</script>
