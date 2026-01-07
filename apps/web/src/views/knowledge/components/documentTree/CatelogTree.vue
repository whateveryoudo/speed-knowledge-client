<template>
    <SkeletonList :loading="loading">
        <a-tree v-if="tree.length > 0" :selectedKeys="[activeKey]" :fieldNames="{ key: 'document_slug' }"
            :virtual="false" class="speed-knowledge-tree" blockNode draggable :tree-data="transformedTree"
            @dragenter="onDragEnter" @drop="onDrop" @select="handleTreeSelect" />
        <Empty0 hasTop v-else description="暂无文档" />
    </SkeletonList>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { type DocumentNodeTreeItem } from '@sk/types';
import { useTree } from './useTree';
const props = withDefaults(defineProps<{
    loading: boolean;
    tree: DocumentNodeTreeItem[];
}>(), {
    loading: false,
    tree: () => [],
})
const cptTree = computed(() => {
    return props.tree
})

const { handleTreeSelect, onDrop, activeKey, transformedTree, onDragEnter } = useTree(cptTree)
</script>
<style lang="less">
@tree-line-height: 32px;

.speed-knowledge-tree.ant-tree {
    background: transparent;

    .ant-tree-switcher {
        margin-top: 4px;
        align-self: auto;
        transition: all 0.1s;
        border-radius: 4px;

        &:hover {
            color: var(--sd-text-grey-900);
            background-color: var(--sd-grey-5);
        }
    }

    // 移除默认的选中样式
    .ant-tree-node-content-wrapper.ant-tree-node-selected,
    .ant-tree-checkbox+span.ant-tree-node-selected {
        background-color: transparent;
    }

    // .ant-tree-node-content-wrapper .ant-tree-switcher {
    // }

    .ant-tree-node-content-wrapper {
        line-height: @tree-line-height;

        &:hover {
            background-color: transparent;
        }
    }

    .ant-tree-treenode {
        padding-bottom: 0;
        margin-bottom: 4px;
        border-radius: 6px;
        padding-left: 2px;

        &:hover,
        &.ant-tree-treenode-selected {
            background-color: var(--sd-bg-primary-hover);
        }
    }
}
</style>