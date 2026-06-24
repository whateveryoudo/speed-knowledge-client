<template>
    <SkeletonList :loading="loading">
        <a-tree v-if="transformedTree.length > 0" :selectedKeys="[activeKey]" v-model:expandedKeys="expandedKeys"
            :fieldNames="{ key: 'id' }" :virtual="false" class="speed-knowledge-tree" blockNode draggable
            :tree-data="transformedTree" @dragenter="onDragEnter" @drop="onDrop" @select="handleTreeSelect">
            <template #title="{ dataRef: record }">
                <a-input ref="renameInputRef" @blur="(e: any) => handleRenameBlur(e.target.value, record)" size="small"
                    v-if="isRenaming(record.id)" :value="record.title" />
                <div v-else class="flex items-center justify-between" @mouseenter="handleMouseEnter(record)"
                    @mouseleave="handleMouseLeave(record)">
                    <span class="flex-1 truncate" :title="record.title">
                        {{ record.title }}
                    </span>
                    <a-space :size="4" class="shrink-0" v-if="showActions(record.id)">
                        <a-dropdown :overlayStyle="{ width: '150px' }" placement="bottomLeft" trigger="click"
                            @open-change="(open: boolean) => handleMoreOpenChange(open, record)">
                            <a-button type="text" class="shadow-btn-wrapper icon" @click.stop>
                                <MoreOutlined />
                            </a-button>
                            <template #overlay>
                                <a-menu @click="(e: any) => handleDocumentMoreClick(record, e.key)"
                                    :items="documentMoreMenus" />
                            </template>
                        </a-dropdown>
                        <a-dropdown :overlayStyle="{ width: '150px' }" placement="bottomLeft" trigger="click"
                            @open-change="(open: boolean) => handleAddOpenChange(open, record)">
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item>
                                        文档
                                    </a-menu-item>
                                </a-menu>
                            </template>
                            <a-button type="text" class="shadow-btn-wrapper icon" @click.stop>
                                <PlusOutlined />
                            </a-button>
                        </a-dropdown>
                    </a-space>
                </div>
            </template>
        </a-tree>
        <Empty0 v-else description="暂无文档" />
    </SkeletonList>
</template>
<script lang="ts" setup>
import { computed, ref, h, watch, nextTick } from 'vue';
import { useTree } from './useTree';
import { type DragDocumentParams, type DocumentNodeTreeItem, type TreeNodeUIState } from '@sk/types';
import { documentMoreMenus } from './menus';
import { Modal, message } from 'ant-design-vue';

const props = withDefaults(defineProps<{
    loading: boolean;
    tree: DocumentNodeTreeItem[];
    nodeUIStateMap: Record<string, TreeNodeUIState>;
    focusRenameNodeId?: string | null;
}>(), {
    loading: false,
    tree: () => [],
    nodeUIStateMap: () => ({}),
    focusRenameNodeId: null,
})

const cptTree = computed(() => props.tree)
const renameInputRef = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{
    (e: 'update-node-ui-state', nodeId: string, updates: Partial<TreeNodeUIState>): void
    (e: 'clear-focus-rename-node'): void
    (e: 'rename-node', params: {
        nodeId: string,
        documentId?: string,
        title: string,
        cb: () => void
    }): Promise<void>
    (e: 'edit-document', params: {
        nodeId: string,
        documentSlug: string,
    }): void
    (e: 'delete-document', params: {
        nodeId: string,
        cb: (res: any) => void
    }): Promise<void>
    (e: 'drag-document-end', params: {
        newTree: DocumentNodeTreeItem[],
        operation: DragDocumentParams
    }): Promise<void>
}>();

const patchUIState = (nodeId: string, updates: Partial<TreeNodeUIState>) => {
    emit('update-node-ui-state', nodeId, updates)
}

const getUI = (nodeId: string): TreeNodeUIState => props.nodeUIStateMap[nodeId] ?? {
    showActions: false,
    moreOpen: false,
    addOpen: false,
    renaming: false,
}

const isRenaming = (nodeId: string) => getUI(nodeId).renaming
const showActions = (nodeId: string) => getUI(nodeId).showActions

const { handleTreeSelect, onDrop, activeKey, transformedTree, onDragEnter, expandedKeys } = useTree(cptTree, emit)

watch(
    () => props.focusRenameNodeId,
    (nodeId) => {
        if (!nodeId) return
        nextTick(() => {
            renameInputRef.value?.focus()
            emit('clear-focus-rename-node')
        })
    },
)

const handleDocumentMoreClick = (record: DocumentNodeTreeItem, key: string) => {
    switch (key) {
        case 'rename':
            patchUIState(record.id, { renaming: true, showActions: true })
            nextTick(() => renameInputRef.value?.focus())
            break
        case 'edit':
            if (record.document_slug) {
                emit('edit-document', { nodeId: record.id, documentSlug: record.document_slug })
            }
            break
        case 'delete':
            Modal.confirm({
                title: '系统提示',
                content: h('span', {}, ['确定删除', h('span', { class: 'mx-1 text-[16px]' }, record.title), '吗？']) as any,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    await emit('delete-document', {
                        nodeId: record.id,
                        cb: (res: any) => {
                            if (res.errCode === 0) message.success('删除成功')
                        }
                    })
                }
            })
            break
    }
}

const handleMoreOpenChange = (open: boolean, record: DocumentNodeTreeItem) => {
    patchUIState(record.id, { moreOpen: open })
    if (!open && !getUI(record.id).addOpen) {
        setTimeout(() => {
            const ui = getUI(record.id)
            if (!ui.moreOpen && !ui.addOpen) patchUIState(record.id, { showActions: false })
        }, 100)
    }
}

const handleAddOpenChange = (open: boolean, record: DocumentNodeTreeItem) => {
    patchUIState(record.id, { addOpen: open })
    if (!open && !getUI(record.id).moreOpen) {
        setTimeout(() => {
            const ui = getUI(record.id)
            if (!ui.moreOpen && !ui.addOpen) patchUIState(record.id, { showActions: false })
        }, 100)
    }
}

const handleMouseEnter = (record: DocumentNodeTreeItem) => {
    patchUIState(record.id, { showActions: true })
}

const handleMouseLeave = (record: DocumentNodeTreeItem) => {
    const ui = getUI(record.id)
    if (ui.moreOpen || ui.addOpen) return
    patchUIState(record.id, { showActions: false })
}

const handleRenameBlur = async (value: string, record: DocumentNodeTreeItem) => {
    if (value === record.title || value.trim() === '') {
        patchUIState(record.id, { renaming: false })
        return
    }
    await emit('rename-node', {
        nodeId: record.id,
        documentId: record.document_id || undefined,
        title: value,
        cb: () => patchUIState(record.id, { renaming: false }),
    })
}
</script>
<style lang="less">
@tree-line-height: 32px;

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

    .ant-tree-node-content-wrapper.ant-tree-node-selected,
    .ant-tree-checkbox+span.ant-tree-node-selected {
        background-color: transparent;
    }

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
