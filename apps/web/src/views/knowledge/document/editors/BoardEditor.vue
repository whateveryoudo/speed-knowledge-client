<template>
  <div class="board-editor-host">
    <SpeedBoard
      v-if="ready"
      :key="editorKey"
      :title="title"
      :readonly="!editable"
      :ydoc="editable ? ydoc ?? undefined : undefined"
      :options="boardOptions"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SpeedBoard } from '@speed-board/vue3-antd'
import type { Collaborator } from '@sk/types'
import { useCollaboration } from '@speed-collaboration/vue3'

const props = defineProps<{
  editorKey: string
  documentId: string
  knowledgeId: string
  title?: string
  editable: boolean
  boardSnapshot: any | null
  collaborationUrl: string
  collaborationToken: string
}>()

const emit = defineEmits<{
  'update:collaborators': [collaborators: Collaborator[]]
  'save': []
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

const { ydoc } = useCollaboration({
  config: collaborationConfig,
  enabled: computed(() => props.editable && !!props.documentId),
  onCollaboratorsChange: (collaborators) => emit('update:collaborators', collaborators as Collaborator[]),
})

const boardOptions = computed(() => {
  const elements = props.boardSnapshot?.elements || []
  return {
    readonly: !props.editable,
    value: JSON.parse(JSON.stringify(elements)),
  }
})

const ready = computed(() => {
  // 1. 预览/只读模式：不需要建立协同，拿到数据直接就是 ready
  if (!props.editable) return true;
  // 2. 协同编辑模式：必须等待协同 ydoc 和 provider 握手同步完成
  return Boolean(ydoc.value);
})

const onSave = () => {
  emit('save')
}
</script>

<style scoped>
.board-editor-host {
  height: calc(100vh - 52px);
  min-height: 480px;
  overflow: hidden;
  position: relative;
}
</style>
