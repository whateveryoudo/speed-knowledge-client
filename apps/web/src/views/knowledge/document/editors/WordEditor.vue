<template>
  <SpeedTiptapEditor
    v-if="ready"
    preset="knowledge"
    :json="contentJson"
    :header-style="headerStyle"
    :main-style="mainStyle"
    :key="editorKey"
    :editable="editable"
    :menubar="editable"
    :title="title"
    :ydoc="editable ? (ydoc ?? undefined) : undefined"
    :provider="editable ? (provider ?? undefined) : undefined"
    :collaboration-user="collaborationUser"
    v-bind="editorBindProps"
    @update:title="onTitleUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SpeedTiptapEditor, useCollaboration } from 'speed-tiptap-editor'
import type { CSSProperties } from 'vue'
import type { Collaborator } from '@sk/types'

const props = defineProps<{
  editorKey: string
  contentJson: string | null
  editable: boolean
  title: string
  headerStyle: CSSProperties
  mainStyle: CSSProperties
  editorProps: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:collaborators': [collaborators: Collaborator[]]
}>()

const collaborationConfig = computed(() => {
  const collaboration = props.editorProps?.collaboration as {
    documentId: string
    url: string
    token: string
    user: Collaborator
  } | undefined

  if (!props.editable || !collaboration?.documentId) {
    return null
  }

  return collaboration
})

const { ydoc, provider } = useCollaboration({
  config: collaborationConfig,
  enabled: computed(() => props.editable),
  onCollaboratorsChange: (users: Collaborator[]) => emit('update:collaborators', users),
})

const collaborationUser = computed(() => collaborationConfig.value?.user ?? null)

const editorBindProps = computed(() => {
  const { collaboration: _collaboration, ...rest } = props.editorProps
  return rest
})

const ready = computed(() => {
  if (!props.editable) {
    return true
  }
  return !!ydoc.value
})

const onTitleUpdate = (val: string) => emit('update:title', val)
</script>
