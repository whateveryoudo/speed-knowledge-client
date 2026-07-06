<template>
  <a-flex vertical class="px-2 h-full">
    <div
      class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[8px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)]"
      :class="{
        'bg-[var(--sd-bg-primary-hover)]': activeKey === '',
      }" @click="handleHomeClick()">
      <HomeOutlined class="mr-2" /> 首页
    </div>
    <div class="text-[var(--sd-text-body)] flex items-center justify-between h-[32px] my-[4px] px-[2px] rounded-[6px]">
      <span class="px-[6px]">目录</span>
      <AddMenu v-if="canDocCreate" :knowledge-id="knowledgeId" trigger-type="icon"
        @add-document-cb="(node) => emit('add-document-cb', node)"
        @add-catalog-node-cb="(node) => emit('add-catalog-node-cb', node)" />
    </div>
    <div class="flex-1 overflow-y-auto">
      <CatelogTree :loading="loading" :tree="tree" :knowledge-id="knowledgeId" :nodeUIStateMap="nodeUIStateMap"
        :focusRenameNodeId="focusRenameNodeId"
        :can-doc-create="canDocCreate"
        :can-doc-edit="canDocEdit"
        :can-doc-delete="canDocDelete"
        @update-node-ui-state="(nodeId, updates) => emit('update-node-ui-state', nodeId, updates)"
        @clear-focus-rename-node="emit('clear-focus-rename-node')" @rename-node="emit('rename-node', $event)"
        @edit-document="emit('edit-document', $event)" @delete-document="emit('delete-document', $event)"
        @drag-document-end="emit('drag-document-end', $event)"
        @add-document-cb="(node) => emit('add-document-cb', node)"
        @add-catalog-node-cb="(node) => emit('add-catalog-node-cb', node)" />
    </div>
  </a-flex>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  type DocumentNodeTreeItem,
  type DragDocumentParams,
  type TreeNodeUIState,
  type DocumentNodeItem,
} from '@sk/types';
import { CatelogTree } from '../documentTree';
import AddMenu from '../addMenu';

defineProps<{
  loading: boolean;
  canDocCreate: boolean;
  canDocEdit: boolean;
  canDocDelete: boolean;
  tree: DocumentNodeTreeItem[];
  nodeUIStateMap: Record<string, TreeNodeUIState>;
  focusRenameNodeId?: string | null;
  knowledgeId: string;
}>()

const route = useRoute();
const router = useRouter();
const emit = defineEmits<{
  (e: 'update-node-ui-state', nodeId: string, updates: Partial<TreeNodeUIState>): void
  (e: 'clear-focus-rename-node'): void
  (e: 'rename-node', params: {
    nodeId: string,
    title: string,
    cb: () => void
  }): Promise<void>
  (e: 'edit-document', params: { nodeId: string; documentSlug: string }): void
  (e: 'delete-document', params: { nodeId: string; cb: (res: any) => void }): Promise<void>
  (e: 'drag-document-end', params: {
    newTree: DocumentNodeTreeItem[],
    operation: DragDocumentParams
  }): Promise<void>
  (e: 'add-document-cb', node: DocumentNodeItem): void
  (e: 'add-catalog-node-cb', node: DocumentNodeItem): void
}>();

const handleHomeClick = () => {
  router.push(`/${route.params.team_slug as string}/knowledge/${route.params.knowledge_slug as string}`);
}

const activeKey = computed(() => route.params.document_slug as string || '');
</script>

<style lang="less" scoped></style>
