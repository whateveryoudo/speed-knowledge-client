<template>
    <a-drawer title="检测面板" :open="visible" @close="handleClose" :mask="false" :maskClosable="false">
        <a-button @click="handleCheck" type="primary">开始检测</a-button>
    </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
    visible: boolean;
}>(), {
    visible: false,
});

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'onCheck', value: Rule[]): void;
}>();

const handleClose = () => {
    emit('update:visible', false);
};
const handleCheck = () => {
    emit('onCheck');
};
</script>

<style scoped></style>