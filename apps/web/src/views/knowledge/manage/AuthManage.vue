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
                        <a-flex vertical>
                            <span>{{ record.user.nickname }}</span>
                            <span class="text-[var(--sd-text-caption)]">{{ record.user.username }}</span>
                        </a-flex>
                    </a-space>
                </template>
                <template v-else-if="column.dataIndex === 'role'">
                    <span>{{KnowledgeCollaboratorRoleOptions.find(item => item.value === record.role)?.label ??
                        '--'}}</span>
                </template>
                <template v-else-if="column.dataIndex === 'operation'">
                    <!-- 创建者无操作项 -->
                    <template v-if="record.source !== KnowledgeCollaboratorSource.CREATOR">
                        <a-space>
                            <template #split>
                                <a-divider type="vertical" />
                            </template>
                        </a-space>
                        <a-space>
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
import { knowledge as knowledgeApi } from '@sk/api';
import { KNOWLEDGE_ID_KEY } from '#sk-web/context/keys';
import { to } from 'await-to-js';
import defaultAvatar from '#sk-web/assets/images/avatar_def.png';
import { KnowledgeCollaboratorRoleOptions, KnowledgeCollaboratorSource, type KnowledgeCollaboratorResponse } from '@sk/types';
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
const selectedRowKeys = ref<string[]>([]);
const onSelectChange = (selectedKeys: string[]) => {
    selectedRowKeys.value = selectedKeys;
};
const handleDelete = (id: string) => {
    console.log(id);
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