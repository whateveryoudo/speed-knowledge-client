<template>
    <a-popover trigger="click" v-model:open="open" :overlayStyle="{ width: '440px' }" placement="bottomRight"
        :arrow="false">
        <template #content>
            <CollaboratorAddMain v-if="open" />
        </template>
        <a-tooltip title="协作">
            <a-button type="text" class="shadow-btn-wrapper">
                <UsergroupAddOutlined style="font-size: 18px;" />
            </a-button>
        </a-tooltip>
    </a-popover>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
import CollaboratorAddMain from './CollaboratorAddMain.vue';
const open = ref(false);


</script>