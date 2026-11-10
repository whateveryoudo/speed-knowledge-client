<template>
  <div class="sheet-editor-host">
    <SpeedSheet
      v-if="ready"
      :key="editorKey"
      lang="zh"
      :editable="editable"
      :ydoc="editable ? ydoc ?? undefined : undefined"
      :sheet-data="editable ? undefined : sheetSnapshot ?? undefined"
      :show-toolbar="editable"
      :show-formula-bar="editable"
      :show-sheet-tabs="true"
      :filter-user-id="filterUserId"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SpeedSheet, type WorkbookSnapshot } from '@speed-sheet/vue3-antd'
import type { Collaborator } from '@sk/types'
import { useUserStore } from '#sk-web/store/useUserStore'
import { useCollaboration } from '@speed-collaboration/vue3'

const props = defineProps<{
  editorKey: string
  documentId: string
  knowledgeId: string
  editable: boolean
  sheetSnapshot: WorkbookSnapshot | null
  collaborationUrl: string
  collaborationToken: string
}>()

const emit = defineEmits<{
  'update:collaborators': [collaborators: Collaborator[]]
}>()

const { userInfo } = storeToRefs(useUserStore())

const filterUserId = computed(() => {
  const id = userInfo.value?.id
  return id != null && id !== 0 ? String(id) : null
})

const collaborationConfig = computed(() => {
  if (!props.documentId || !props.knowledgeId) return null
  return {
    documentId: props.documentId,
    knowledgeId: props.knowledgeId,
    url: `${props.collaborationUrl}/collaboration?knowledgeId=${props.knowledgeId}`,
    token: props.collaborationToken,
  }
})

const { ydoc } = useCollaboration({
  config: collaborationConfig,
  enabled: computed(() => props.editable && !!props.documentId),
  onCollaboratorsChange: (collaborators) => emit('update:collaborators', collaborators as Collaborator[]),
})

const ready = computed(() => {
  // 1. 预览/只读模式：不需要建立协同，拿到数据直接就是 ready
  if (!props.editable) return true;
  // 2. 协同编辑模式：必须等待协同 ydoc 和 provider 握手同步完成
  return Boolean(ydoc.value);
})
</script>

<style scoped>
.sheet-editor-host {
  height: calc(100vh - 52px);
  min-height: 480px;
  overflow: hidden;
}

.sheet-editor-host :deep(.speed-sheet-root) {
  height: 100%;
}
</style>
