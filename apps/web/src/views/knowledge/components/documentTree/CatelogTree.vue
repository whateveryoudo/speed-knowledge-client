<template>
    <SkeletonList :loading="loading">
        <a-tree v-if="transformedTree.length > 0" :selectedKeys="[activeKey]" v-model:expandedKeys="expandedKeys"
            :fieldNames="{ key: 'id' }" :virtual="false" class="speed-knowledge-tree" blockNode draggable
            :tree-data="transformedTree" @dragenter="onDragEnter" @drop="onDrop" @select="handleTreeSelect">
            <template #title="{ dataRef: record }">
                <a-input ref="renameInputRef" @blur="(e: any) => handleRenameBlur(e.target.value, record)" size="small"
                    v-if="getNodeUIState(record.id, 'renaming')" :value="record.title" />
                <div v-else class="flex items-center justify-between" @mouseenter="handleMouseEnter(record)"
                    @mouseleave="handleMouseLeave(record)">
                    <span class="flex-1 truncate" :title="record.title">
                        {{ record.title }}
                    </span>
                    <a-space :size="4" class="shrink-0" v-if="getNodeUIState(record.id, 'showActions')">
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
import { computed, ref, h } from 'vue';
import { useTree } from './useTree';
import { type DragDocumentParams, type DocumentNodeTreeItem } from '@sk/types';
import { documentMoreMenus } from './menus';
import { Modal, message } from 'ant-design-vue';
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
const renameInputRef = ref<HTMLInputElement | null>(null)
const emit = defineEmits<{
    (e: 'rename-document', params: {
        id: string,
        title: string,
        cb: () => void
    }): Promise<void>
    (e: 'delete-document', params: {
        id: string,
        cb: (res: any) => void
    }): Promise<void>
    (e: 'drag-document-end', params: {
        newTree: DocumentNodeTreeItem[],
        operation: DragDocumentParams
    }): Promise<void>
}>();
const { handleTreeSelect, onDrop, activeKey, transformedTree, onDragEnter, expandedKeys,
    getNodeUIState,
    setNodeUIState,
} = useTree(cptTree, emit)
const handleDocumentMoreClick = (record: DocumentNodeTreeItem, key: string) => {
    console.log(key)
    switch (key) {
        case 'rename':
            setNodeUIState(record.id, { renaming: true })
            setTimeout(() => {
                renameInputRef.value?.focus()
            }, 100)
            break
        case 'edit':
            record.mode = 'edit'
            break
        case 'delete':
            Modal.confirm({
                title: '系统提示',
                content: h('span', {}, ['确定删除', h('span', { class: 'mx-1 text-[16px]' }, record.title), '吗？']) as any,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    await emit('delete-document', {
                        id: record.document_id,
                        cb: (res: any) => {
                            console.log(res)
                            if (res.code === 0) {
                                message.success('删除成功')
                            }
                        }
                    })
                }
            })
            break
    }
}
const handleMoreOpenChange = (open: boolean, record: DocumentNodeTreeItem) => {
    setNodeUIState(record.id, { moreOpen: open })
    if (!open && !getNodeUIState(record.id, 'addOpen')) {
        setTimeout(() => {
            if (!getNodeUIState(record.id, 'moreOpen') && !getNodeUIState(record.id, 'addOpen')) {
                setNodeUIState(record.id, { showActions: false })
            }
        }, 100)
    }
}
const handleAddOpenChange = (open: boolean, record: DocumentNodeTreeItem) => {
    setNodeUIState(record.id, { addOpen: open })
    // 如果关闭了，且另一个 dropdown 也没打开，且鼠标不在节点上，则隐藏 actions
    if (!open && !getNodeUIState(record.id, 'moreOpen')) {
        setTimeout(() => {
            if (!getNodeUIState(record.id, 'moreOpen') &&
                !getNodeUIState(record.id, 'addOpen')) {
                setNodeUIState(record.id, { showActions: false })
            }
        }, 100)
    }
}
const handleMouseEnter = (record: DocumentNodeTreeItem) => {
    setNodeUIState(record.id, { showActions: true })
}
const handleMouseLeave = (record: DocumentNodeTreeItem) => {
    const moreOpen = getNodeUIState(record.id, 'moreOpen')
    const addOpen = getNodeUIState(record.id, 'addOpen')
    if (moreOpen || addOpen) return
    setNodeUIState(record.id, { showActions: false })
}
const handleRenameBlur = async (value: string, record: DocumentNodeTreeItem) => {
    if (value === record.title || value.trim() === '') {
        setNodeUIState(record.id, { renaming: false })
        return
    }
    await emit('rename-document', {
        id: record.document_id, // 这里直接更改文档信息
        title: value,
        cb: () => {
            record.title = value
            setNodeUIState(record.id, { renaming: false })
        }
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