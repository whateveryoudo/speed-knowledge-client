<template>
    <SkeletonList :loading="loading">
        <a-tree v-if="transformedTree.length > 0" :selectedKeys="[activeKey]" v-model:expandedKeys="expandedKeys"
            :fieldNames="{ key: 'id' }" :virtual="false" class="speed-knowledge-tree" blockNode
            :tree-data="transformedTree" @select="handleTreeSelect">
            <template #title="{ dataRef: record }">
                <div class="flex items-center justify-between gap-4 pr-1">
                    <span class="truncate" :title="record.title">
                        {{ record.title }}
                    </span>
                    <template v-if="record.type !== DocumentNodeType.TITLE">
                        <div class="h-[1px] flex-1 border-t-[1px] border-t-dashed border-t-[var(--sd-grey-5)]"></div>
                        <span class="text-[var(--sd-text-caption)]">{{
                            transformDatatimeToRecentText(record.content_updated_at) }}</span>
                    </template>
                </div>
            </template>
            <template #switcherIcon="{ switcherCls }"><down-outlined :class="switcherCls" /></template>
        </a-tree>
    </SkeletonList>
</template>
<script lang="ts" setup>
import { computed, ref, h } from 'vue';
import { useTree } from './useTree';
import { type DragDocumentParams, type DocumentNodeTreeItem } from '@sk/types';
import { DownOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { DocumentNodeType } from '@sk/types';
import { transformDatatimeToRecentText } from '@sk/utils';
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
const emit = defineEmits<{
    (e: 'rename-document', params: {
        id: string,
        title: string,
        cb: () => void
    }): Promise<void>
    (e: 'delete-document', params: {
        id: string,
        cb: () => void
    }): Promise<void>
    (e: 'drag-document-end', params: {
        newTree: DocumentNodeTreeItem[],
        operation: DragDocumentParams
    }): Promise<void>
}>();
const { activeKey, transformedTree, expandedKeys, handleTreeSelect
} = useTree(cptTree, emit)
</script>
<style lang="less">
@tree-line-height: 34px;

.speed-knowledge-tree.ant-tree {
    padding: 8px 0;
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
        min-width: 0;

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