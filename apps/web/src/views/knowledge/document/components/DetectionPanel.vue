<template>
    <a-drawer title="检测面板" :open="visible" @close="handleClose" :mask="false" :maskClosable="false">
        我是文档纠错
    </a-drawer>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    visible: boolean;
}>(), {
    visible: false,
});

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
}>();

const handleClose = () => {
    emit('update:visible', false);
};
</script>

<style scoped></style>