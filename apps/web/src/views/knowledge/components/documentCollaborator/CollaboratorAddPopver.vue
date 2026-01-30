<template>
    <a-popover trigger="click" v-model:visible="visible" :overlayStyle="{ width: '440px' }" placement="bottomRight"
        :arrow="false">
        <template #content>
            <CollaboratorAddMain v-if="visible" />
        </template>
        <a-tooltip title="协作">
            <a-button type="text" class="shadow-btn-wrapper">
                <UsergroupAddOutlined />
            </a-button>
        </a-tooltip>
    </a-popover>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
import CollaboratorAddMain from './CollaboratorAddMain.vue';
const visible = ref(false);


</script>