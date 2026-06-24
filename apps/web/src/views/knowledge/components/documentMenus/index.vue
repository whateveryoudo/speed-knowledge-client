<template>
  <a-flex vertical class="px-2 h-full">
    <div
      class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[8px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)]"
      :class="{
        'bg-[var(--sd-bg-primary-hover)]': activeKey === '',
      }" @click="handleHomeClick()">
      <HomeOutlined class="mr-2" /> 首页
    </div>
    <div class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[2px] rounded-[6px]">
      <a-dropdown>
        <a-button type="text" class="shadow-btn-wrapper">
          <template #icon>
            <UnorderedListOutlined />
          </template>
          目录
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1">1st menu item</a-menu-item>
            <a-menu-item key="2">2nd menu item</a-menu-item>
            <a-menu-item key="3">3rd item</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="flex-1 overflow-y-auto">
      <CatelogTree
        :loading="loading"
        :tree="tree"
        :nodeUIStateMap="nodeUIStateMap"
        :focusRenameNodeId="focusRenameNodeId"
        @update-node-ui-state="(nodeId, updates) => emit('update-node-ui-state', nodeId, updates)"
        @clear-focus-rename-node="emit('clear-focus-rename-node')"
        @rename-node="emit('rename-node', $event)"
        @edit-document="emit('edit-document', $event)"
        @delete-document="emit('delete-document', $event)"
        @drag-document-end="emit('drag-document-end', $event)"
      />
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
} from '@sk/types';
import { CatelogTree } from '../documentTree';

defineProps<{
  loading: boolean;
  tree: DocumentNodeTreeItem[];
  nodeUIStateMap: Record<string, TreeNodeUIState>;
  focusRenameNodeId?: string | null;
}>()

const route = useRoute();
const router = useRouter();
const emit = defineEmits<{
  (e: 'update-node-ui-state', nodeId: string, updates: Partial<TreeNodeUIState>): void
  (e: 'clear-focus-rename-node'): void
  (e: 'rename-node', params: {
    nodeId: string,
    documentId?: string,
    title: string,
    cb: () => void
  }): Promise<void>
  (e: 'edit-document', params: { nodeId: string; documentSlug: string }): void
  (e: 'delete-document', params: { nodeId: string; cb: (res: any) => void }): Promise<void>
  (e: 'drag-document-end', params: {
    newTree: DocumentNodeTreeItem[],
    operation: DragDocumentParams
  }): Promise<void>
}>();

const handleHomeClick = () => {
  router.push(`/${route.params.team_slug as string}/knowledge/${route.params.slug as string}`);
}

const activeKey = computed(() => route.params.document_slug as string || '');
</script>

<style lang="less" scoped></style>
