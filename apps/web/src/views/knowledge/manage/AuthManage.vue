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
        <a-table :columns="columns" :data-source="data" :pagination="false">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'operation'">
                    <a-space>
                        <template #split>
                            <a-divider type="vertical" />
                        </template>
                    </a-space>
                    <a-button type="text" @click="handleDelete(record.id)" :icon="h(DeleteOutlined)"></a-button>
                </template>
            </template>
        </a-table>
        <!-- 添加协作者弹窗 -->
        <CollaboratorAdd :visible="collaboratorAddVisible"
            @update:visible="(val: boolean) => collaboratorAddVisible = val" />
    </a-flex>
</template>
<script lang="ts" setup>
import { ref, h, reactive } from 'vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import CollaboratorAdd from './components/CollaboratorAdd.vue';
const value = ref(false);
const collaboratorAddVisible = ref(false);
const handleSearch = (value: string) => {
    console.log(value);
};
const columns = ref([
    {
        title: '用户',
        dataIndex: 'name',
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
const data = ref([
    {
        id: '1',
        name: '张三',
        role: 'admin',
    },
]);
const handleDelete = (id: string) => {
    console.log(id);
};
</script>