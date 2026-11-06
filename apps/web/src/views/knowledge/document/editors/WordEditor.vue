<template>
  <KnowledgeEditor
    :json="contentJson"
    :header-style="headerStyle"
    :main-style="mainStyle"
    :key="editorKey"
    :editable="editable"
    :menubar="editable"
    :title="title"
    :ydoc="ydoc"
    :provider="provider"
    :user="currentUser"
    v-bind="sanitizedEditorProps"
    @update:title="onTitleUpdate"
    @update:collaborators="(users) => emit('update:collaborators', users as Collaborator[])"
  />
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { KnowledgeEditor } from '@speed-editor/knowledge-editor'
import { useUserStore } from '#sk-web/store/useUserStore'
import type { Collaborator } from '@sk/types'
import { useCollaboration, type CollaborationUser } from '@speed-collaboration/vue3'

const props = defineProps<{
  editorKey: string
  contentJson: string | null | Record<string, unknown>
  editable: boolean
  title: string
  documentId?: string
  knowledgeId?: string
  collaborationUrl?: string
  collaborationToken?: string
  headerStyle: CSSProperties
  mainStyle: CSSProperties
  editorProps: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:collaborators': [collaborators: Collaborator[]]
}>()

const { userInfo } = storeToRefs(useUserStore())

const currentUser = computed<CollaborationUser | null>(() => {
  if (!userInfo.value) return null
  return {
    id: userInfo.value.id,
    nickname: userInfo.value.nickname,
    username: userInfo.value.username,
    avatar: userInfo.value.avatar,
    color: userInfo.value.color,
  }
})

const collaborationConfig = computed(() => {
  if (!props.documentId || !props.knowledgeId || !props.collaborationUrl) return null
  return {
    documentId: props.documentId,
    knowledgeId: props.knowledgeId,
    url: `${props.collaborationUrl}/collaboration?knowledgeId=${props.knowledgeId}`,
    token: props.collaborationToken ?? '',
    user: currentUser.value ?? undefined,
  }
})

const { ydoc, provider } = useCollaboration({
  config: collaborationConfig,
  enabled: computed(() => props.editable && !!props.documentId),
  onCollaboratorsChange: (collaborators) => emit('update:collaborators', collaborators as Collaborator[]),
})

// 过滤掉从外部透传可能附带的旧 collaborationConfig，确保完全使用外置 ydoc/provider
const sanitizedEditorProps = computed(() => {
  const { collaborationConfig: _unused, ...rest } = props.editorProps || {}
  return rest
})

const onTitleUpdate = (val: string) => emit('update:title', val)
</script>
