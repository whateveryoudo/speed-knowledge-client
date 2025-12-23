<template>
    <a-flex>
        <a-input ref="inputRef" :placeholder="placeholder"
            :style="{ width: expanded ? `${props.expandedWidth}px` : 'auto' }" v-if="expanded" @blur="expanded = false"
            @change="handleChange">
            <template #prefix>
                <SearchOutlined />
            </template>
        </a-input>
        <a-tooltip v-else title="搜索" placement="top">
            <a-button type="text" class="shadow-btn-wrapper" :icon="h(SearchOutlined)" @click="showInput()"></a-button>
        </a-tooltip>
    </a-flex>
</template>
<script lang="ts" setup>
import { SearchOutlined } from '@ant-design/icons-vue';
import { ref, h, nextTick } from 'vue';
defineOptions({
    name: 'FlexSearch',
})
const props = withDefaults(defineProps<{
    expandedWidth?: number;
    placeholder?: string;
}>(), {
    expandedWidth: 200,
    placeholder: '请输入',
});
const inputRef = ref<HTMLInputElement | null>(null);
const expanded = ref(false);
const emit = defineEmits<{
    (e: 'change', value: string): void;
}>();
const showInput = () => {
    expanded.value = true;
    nextTick(() => {
        inputRef.value?.focus();
    });
};
const handleChange = (e: Event) => {
    emit('change', (e.target as HTMLInputElement).value);
};
</script>