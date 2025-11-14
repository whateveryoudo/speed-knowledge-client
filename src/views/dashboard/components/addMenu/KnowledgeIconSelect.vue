<template>
    <a-popover trigger="click" placement="bottom" :overlay-style="{ width: '220px' }">
        <template #title>
            <div class="text-[14px] font-medium text-[var(--ant-color-text)]">默认</div>
        </template>
        <template #content>
            <div class="grid grid-cols-5 gap-2">
                <div v-for="item in avatarList" :key="item"
                    class="p-1 flex items-center justify-center cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] rounded-md">
                    <s-icon-font @click="emit('update:value', item)" :type="item" svg-sprite
                        style="width: 24px; height: 24px;" />
                </div>

            </div>
        </template>
        <div
            class="px-1 flex items-center justify-center border border-solid border-[var(--ant-color-border)] rounded-md cursor-pointer">
            <s-icon-font :type="value" svg-sprite style="width: 24px; height: 24px;" />
        </div>
    </a-popover>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = withDefaults(defineProps<{
    value: string
}>(), {
    value: 'icon-book-0'
})
const emit = defineEmits(['update:value'])

const avatarList = ref([
    'icon-book-0',
    'icon-book-1',
    'icon-book-2',
    'icon-book-3',
    'icon-book-4',
    'icon-book-5',
    'icon-book-6',
    'icon-book-7',
    'icon-book-8',
    'icon-book-9',
    'icon-book-10',
    'icon-book-11',
    'icon-book-12',
    'icon-book-13',
    'icon-book-14'
])
</script>