<template>
    <a-flex v-if="!knowledgeError" class="h-full">
        <s-collapse-hz v-if="showKnowledgeLeftPanel" expandDir="right" triggerMode="hover" v-model:open="open"
            expandAttrBefore="flex: 0 0 10px" :expandAttrAfter="`flex: 0 0 ${width}px`" fixed-trigger-expand-after>
            <template #expand-render>
                <a-flex vertical gap="small" ref="expandWrapRef"
                    class="h-full relative pt-2 bg-[var(--sd-bg-secondary)]">
                    <a-flex class="px-2 w-full" justify="space-between" align="center">
                        <a-space>
                            <img @click="router.push('/dashboard')" :src="Logo" alt="logo"
                                class="w-[16px] cursor-pointer h-auto relative top-[2px]" />
                            <RightOutlined class="text-xs" />
                            <span
                                class="text-xs cursor-pointer text-[var(--sd-grey-7)] hover:text-[var(--sd-text-body)]"
                                @click="router.push('/dashboard')">{{ breadcrumbName }}</span>
                        </a-space>
                    </a-flex>
                    <a-flex class="px-2 w-full" justify="space-between" align="center">
                        <a-space>
                            <s-icon-font :type="knowledgeInfo.icon" style="width: 22px;height: 22px"
                                svg-sprite></s-icon-font>
                            <span class="font-bold">{{ knowledgeInfo.name || '--' }}</span>
                            <a-tooltip>
                                <template #title>
                                    <span>{{ knowledgeInfo.is_public ? '公开知识库' : '私有知识库' }}</span>
                                    <a-button type="link" size="small" @click="handleTogglePublic">切换公开性</a-button>
                                </template>
                                <UnlockOutlined class="text-[var(--sd-grey-7)]" v-if="knowledgeInfo.is_public" />
                                <LockOutlined class="text-[var(--sd-grey-7)]" v-else />
                            </a-tooltip>
                        </a-space>
                        <!-- 更多操作 -->
                        <a-dropdown>
                            <EllipsisOutlined />
                            <template #overlay>
                                <a-menu @click="handleMoreOpt" :items="manageMenus">
                                </a-menu>
                            </template>
                        </a-dropdown>

                    </a-flex>
                    <a-flex class="px-2" :gap="10">
                        <a-input readonly class="ant-input-readonly border-none max-w-[250px]" @click="openKnowledgeSearch">
                            <template #prefix>
                                <s-icon-font type="icon-kl-sousuo" class="mr-1" />
                                搜索
                            </template>
                        </a-input>
                        <AddMenu :knowledgeId="knowledgeInfo.id" @add-document-cb="handleAddDocumentCb"
                            @add-catalog-node-cb="handleAddCatalogNodeCb" />
                    </a-flex>

                    <a-divider class="my-1" />
                    <div class="flex-1 overflow-y-auto">
                        <!-- 知识库下的文档树 -->
                        <DocumentMenus :loading="documentLoading" :tree="documentTree" :knowledge-id="knowledgeInfo.id"
                            :nodeUIStateMap="nodeUIStateMap"
                            :focusRenameNodeId="focusRenameNodeId" @update-node-ui-state="knowledgeStore.setNodeUIState"
                            @clear-focus-rename-node="knowledgeStore.clearFocusRenameNode"
                            @rename-node="handleRenameNode" @edit-document="handleEditDocument"
                            @delete-document="handleDeleteDocument"
                            @drag-document-end="knowledgeStore.handleDragDocumentEnd"
                            @add-document-cb="handleAddDocumentCb" @add-catalog-node-cb="handleAddCatalogNodeCb" />
                    </div>
                </a-flex>
                <div @mouseenter.stop="openTooltip = false"
                    class="w-6px absolute top-0 right-0 bottom-0 border border-r border-r-solid border-[var(--sd-border-light)] cursor-col-resize"
                    @pointerdown="startResize('right', $event)">
                </div>
            </template>
            <!-- 自定义触发器 -->
            <template #trigger-render>
                <a-tooltip v-model:open="openTooltip" placement="right" :title="open ? '收起' : '展开'">
                    <div @click="handleToggle"
                        class="absolute flex items-center justify-center cursor-pointer bg-[var(--ant-color-bg-base)] z-10 top-[50%] translate-y-[-50%] right-[-7px] w-[14px] h-[44px] border border-solid border-[var(--sd-border-grey-4)] rounded-[8px] shadow-[0_2px_8px_0_rgba(0,0,0,.06)]">
                        <CaretRightOutlined class="text-[12px]" v-if="!open" />
                        <CaretLeftOutlined class="text-[12px]" v-else />
                    </div>
                </a-tooltip>
            </template>
        </s-collapse-hz>
        <div class="flex-1 overflow-y-auto">
            <router-view></router-view>
        </div>
        <KnowledgeSearchModal
            v-model:open="knowledgeSearchOpen"
            :knowledge-id="knowledgeInfo.id"
            :knowledge-name="knowledgeInfo.name"
            :knowledge-slug="knowledgeInfo.slug"
            :team-slug="knowledgeInfo.team?.slug"
            :document-tree="documentTree"
        />
        <!-- 拦截操作 -->
    </a-flex>
    <not-found v-else :title="knowledgeError.errMessage" />
</template>

<script lang="tsx" setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, type VNode, h } from 'vue';
import { useEdgeResize } from '#sk-web/hooks';
import Logo from '#sk-web/assets/logo.png';
import { useRouter, useRoute } from 'vue-router';
import { CaretRightOutlined, CaretLeftOutlined, RightOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import { storeToRefs } from 'pinia'
import AddMenu from './components/addMenu';
import { useSystemStore } from '#sk-web/store/useSystemStore';
import type { DocumentNodeItem } from '@sk/types';
import DocumentMenus from './components/documentMenus/index.vue';
import { KnowledgeSearchModal } from '#sk-web/components/search';
import { useToggle } from '@vueuse/core';
const DEFAULT_EXPAND_WIDTH = 253;
const open = ref(!localStorage.getItem('sk_knowledge_expand') || localStorage.getItem('sk_knowledge_expand') === 'true');
const expandWrapRef = ref<HTMLElement | null>(null);
const router = useRouter();
const route = useRoute();
const knowledgeStore = useKnowledgeStore()
const systemStore = useSystemStore();
const { knowledgeInfo, knowledgeError, documentTree, documentLoading, breadcrumbName, showKnowledgeLeftPanel, focusRenameNodeId, nodeUIStateMap } = storeToRefs(knowledgeStore)
const { width, startResize } = useEdgeResize(expandWrapRef, { width: Number(localStorage.getItem('sk_knowledge_expand_width')) || DEFAULT_EXPAND_WIDTH }, {
    minWidth: 200, maxWidth: 400,
    onResizeEnd: ({ width, height }: { width: number; height: number }) => {
        console.log('拖拽结束', width, height)
        // 这里存入到本地
        systemStore.setKnowledgeSidebarWidth(width);
    }
})
const openTooltip = ref(false);
const [knowledgeSearchOpen, toggleKnowledgeSearch] = useToggle(false);
const openKnowledgeSearch = () => {
    toggleKnowledgeSearch(true);
};
const slug = computed(() => route.params.knowledge_slug)
type ItemType = {
    type?: 'group';
    label: string;
    key: string;
    icon?: () => VNode;
}
const manageMenus = ref<ItemType[]>([
    {
        label: '权限',
        key: 'auth',
        icon: () => h(LockOutlined)
    }
]);
const handleToggle = () => {
    open.value = !open.value;
    openTooltip.value = false;
    systemStore.setKnowledgeSidebarWidth(open.value ? width.value : 0, false);
}

const handleTogglePublic = () => {
    // TODO:
}
const handleAddDocumentCb = (node: DocumentNodeItem) => {
    knowledgeStore.appendDocumentNode(node)
    knowledgeStore.updateNode(node.id, { mode: 'edit' })
    router.push(`/${route.params.team_slug as string}/knowledge/${slug.value}/document/${node.document_slug}`)
}
// 新增目录节点（这里主要是目录节点）
const handleAddCatalogNodeCb = (node: DocumentNodeItem) => {
    knowledgeStore.appendDocumentNode(node)
    knowledgeStore.setNodeUIState(node.id, { renaming: true, showActions: true })
}

const handleRenameNode = async (params: {
    nodeId: string,
    title: string,
    cb?: () => void,
}) => {
    await knowledgeStore.handleRenameNode(params, params.cb)
}

const handleEditDocument = (params: { nodeId: string; documentSlug: string }) => {
    knowledgeStore.handleEditDocument(params.nodeId, params.documentSlug)
}

const handleDeleteDocument = async (params: {
    nodeId: string,
    cb?: (res: any) => void
}) => {
    await knowledgeStore.deleteTreeNode(params.nodeId, params.cb);
}
const handleMoreOpt = (e: any) => {
    switch (e.key) {
        case 'auth':
            router.push(`/${route.params.team_slug as string}/knowledge/${slug.value}/manage/auth`);
            break;
    }
}
// 监听展开收起变化，同步本地存储
watch(open, (newVal: boolean) => {
    localStorage.setItem('sk_knowledge_expand', newVal ? 'true' : 'false');
})
onMounted(() => {
    // 重置store
    knowledgeStore.$reset();
})

knowledgeStore.initKnowledge();
</script>

<style lang="less" scoped></style>