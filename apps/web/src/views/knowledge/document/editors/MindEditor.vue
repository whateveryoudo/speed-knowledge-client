<template>
  <div class="mind-editor-host">
    <SpeedMindmap
      v-if="ready"
      :key="editorKey"
      :title="title"
      :data="mindData"
      :options="mindOptions"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SpeedMindmap } from '@speed-board/vue3-antd'
import type { Collaborator } from '@sk/types'
import { useCollaboration } from '@speed-collaboration/vue3'

const props = defineProps<{
  editorKey: string
  documentId: string
  knowledgeId: string
  title?: string
  editable: boolean
  mindSnapshot: any | null
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

const mindData = computed(() => {
  const elements = props.mindSnapshot?.elements
  if (Array.isArray(elements) && elements.length > 0) {
    return elements[0]
  }
  return undefined
})

const mindOptions = computed(() => {
  return {
    readonly: !props.editable,
  }
})

const ready = computed(() => {
  if (!props.documentId) return false
  if (props.editable) return !!ydoc.value
  return !!props.mindSnapshot
})

const onSave = () => {
  emit('save')
}
</script>

<style scoped>
.mind-editor-host {
  height: calc(100vh - 52px);
  min-height: 480px;
  overflow: hidden;
  position: relative;
}
</style>
