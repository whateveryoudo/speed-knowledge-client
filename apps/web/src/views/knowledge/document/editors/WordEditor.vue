<template>
  <div ref="wrapperRef" class="word-editor-wrapper w-full h-full">
    <KnowledgeEditor
      ref="knowledgeEditorRef"
      v-if="ready"
      :autofocus="false"
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
      v-bind="editorProps"
      @update:title="onTitleUpdate"
      @update:collaborators="(users) => emit('update:collaborators', users as Collaborator[])"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, type CSSProperties } from 'vue'
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

const wrapperRef = ref<HTMLElement | null>(null)
const knowledgeEditorRef = ref<any>(null)
let savedScrollTop = 0
let scrollContainer: HTMLElement | null = null

function findScrollContainer(el: HTMLElement | null): HTMLElement | null {
  let parent = el?.parentElement
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent
    }
    parent = parent.parentElement
  }
  return (document.scrollingElement || document.documentElement) as HTMLElement
}

watch(
  () => props.editable,
  (newVal) => {
    scrollContainer = findScrollContainer(wrapperRef.value)
    if (scrollContainer) {
      savedScrollTop = scrollContainer.scrollTop
    }
    // 垫底容器高度，防止组件销毁/重建期间高度塌陷导致浏览器自动将滚动条归零置顶
    if (wrapperRef.value && wrapperRef.value.offsetHeight > 0) {
      wrapperRef.value.style.minHeight = `${wrapperRef.value.offsetHeight}px`
    }
  },
)

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

const ready = computed(() => {
  // 1. 预览/只读模式：不需要建立协同，拿到数据直接就是 ready
  if (!props.editable) return true
  // 2. 协同编辑模式：必须等待协同 ydoc 和 provider 握手同步完成
  return Boolean(ydoc.value)
})

watch(ready, (isReady) => {
  if (isReady) {
    nextTick(() => {
      requestAnimationFrame(() => {
        // 1. 恢复视口滚动位置到原位
        if (savedScrollTop > 0 && scrollContainer) {
          scrollContainer.scrollTop = savedScrollTop
        }
        if (wrapperRef.value) {
          wrapperRef.value.style.minHeight = ''
        }

        // 2. 聚焦：若首个节点是大标题 (doc-title)，跳过标题精准定位到正文第一行（第一个段落）
        const editor = knowledgeEditorRef.value?.editor
        if (editor) {
          const { doc } = editor.state
          let focusPos: number | 'start' = 'start'
          if (doc.firstChild && doc.firstChild.type.name.includes('title')) {
            const afterTitlePos = doc.firstChild.nodeSize
            if (doc.nodeSize > afterTitlePos + 2) {
              focusPos = afterTitlePos + 1
            }
          }
          editor.commands.focus(focusPos, { scrollIntoView: false })
        }

        savedScrollTop = 0
      })
    })
  }
})

const onTitleUpdate = (val: string) => emit('update:title', val)
</script>
