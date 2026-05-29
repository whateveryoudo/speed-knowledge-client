import { onUnmounted, shallowRef, watch, type Ref } from 'vue'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import type { Collaborator } from '@sk/types'

export interface SheetCollaborationConfig {
  documentId: string
  knowledgeId: string
  url: string
  token: string
}

export function useSheetCollaboration(options: {
  config: Ref<SheetCollaborationConfig | null>
  enabled: Ref<boolean>
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void
}) {
  const { config, enabled, onCollaboratorsChange } = options
  const ydoc = shallowRef<Y.Doc | null>(null)
  const providerRef = shallowRef<HocuspocusProvider | null>(null)
  let currentDoc: Y.Doc | null = null
  let provider: HocuspocusProvider | null = null

  const destroy = () => {
    provider?.destroy()
    provider = null
    providerRef.value = null
    // currentDoc 始终持有 setup 创建的 doc 引用，确保不泄漏
    if (currentDoc) {
      currentDoc.destroy()
      currentDoc = null
    }
    ydoc.value = null
  }

  const setup = () => {
    destroy()
    const cfg = config.value
    if (!enabled.value || !cfg?.documentId) return

    const doc = new Y.Doc()
    currentDoc = doc
    provider = new HocuspocusProvider({
      name: cfg.documentId,
      url: cfg.url,
      token: cfg.token,
      document: doc,
      onSynced: () => {
        // 等服务端数据同步到本地 ydoc 后，再暴露给 SpeedSheet 组件
        // 避免 SpeedSheet 用空 ydoc 初始化导致结构缺失
        ydoc.value = doc
        providerRef.value = provider
      },
      onAwarenessUpdate: ({ states }) => {
        const users = states
          .map((s: any) => s.user)
          .filter((u: any): u is Collaborator => !!u)
        onCollaboratorsChange?.(users)
      },
    })
  }

  watch([config, enabled], setup, { immediate: true, deep: true })
  onUnmounted(destroy)

  return { ydoc, provider: providerRef }
}