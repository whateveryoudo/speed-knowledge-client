<template>
  <SpeedTiptapEditor
    :json="contentJson"
    :header-style="headerStyle"
    :main-style="mainStyle"
    :key="editorKey"
    :editable="editable"
    :menubar="editable"
    :title="title"
    scene="knowledge"
    v-bind="editorProps"
    @update:title="onTitleUpdate"
    @update:collaborators="onCollaboratorsChange"
  />
</template>

<script setup lang="ts">
import { SpeedTiptapEditor } from 'speed-tiptap-editor'
import type { CSSProperties } from 'vue'
import type { Collaborator } from '@sk/types'

defineProps<{
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

const onTitleUpdate = (val: string) => emit('update:title', val)
const onCollaboratorsChange = (collaborators: Collaborator[]) => emit('update:collaborators', collaborators)
</script>
