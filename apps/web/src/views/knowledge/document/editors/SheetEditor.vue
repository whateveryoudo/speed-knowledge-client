<template>
  <div class="sheet-editor-host">
    <SpeedSheet
      v-if="ready"
      :key="editorKey"
      lang="zh"
      :ydoc="editable ? ydoc ?? undefined : undefined"
      :sheet-data="editable ? undefined : sheetSnapshot ?? undefined"
      :show-toolbar="editable"
      :show-formula-bar="editable"
      :show-sheet-tabs="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SpeedSheet } from '@speed-sheet/vue3-antd'
import type { WorkbookSnapshot } from '@speed-sheet/shared'
import type { Collaborator } from '@sk/types'
import { useSheetCollaboration } from '../composables/useSheetCollaboration'

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

const collaborationConfig = computed(() => {
  if (!props.documentId || !props.knowledgeId) return null
  return {
    documentId: props.documentId,
    knowledgeId: props.knowledgeId,
    url: `${props.collaborationUrl}/collaboration?knowledgeId=${props.knowledgeId}`,
    token: props.collaborationToken,
  }
})

const { ydoc } = useSheetCollaboration({
  config: collaborationConfig,
  enabled: computed(() => props.editable && !!props.documentId),
  onCollaboratorsChange: (collaborators) => emit('update:collaborators', collaborators),
})

const ready = computed(() => {
  if (!props.documentId) return false
  if (props.editable) return !!ydoc.value
  return !!props.sheetSnapshot
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
