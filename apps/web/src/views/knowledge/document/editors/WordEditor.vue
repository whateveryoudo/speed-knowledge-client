<template>
  <KnowledgeEditor
    :json="contentJson"
    :header-style="headerStyle"
    :main-style="mainStyle"
    :key="editorKey"
    :editable="editable"
    :menubar="editable"
    :title="title"
    v-bind="editorProps"
    @update:title="onTitleUpdate"
    @update:collaborators="(users) => emit('update:collaborators', users as Collaborator[])"
  />
</template>

<script setup lang="ts">
import { KnowledgeEditor } from '@speed-tiptap-editor/knowledge-editor'
import '@speed-tiptap-editor/knowledge-editor/style.css'
import type { CSSProperties } from 'vue'
import type { Collaborator } from '@sk/types'
defineProps<{
  editorKey: string
  contentJson: string | null | Record<string, unknown>
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
</script>
