import { computed, type Ref } from 'vue'
import { apiVersion } from '@sk/api'
import type { DocumentItem } from '@sk/types'
import type { UserInfo } from '@sk/types'

/**
 * Word 编辑器 props（含 collaboration 配置）。
 *
 * @see ../COLLABORATION.md
 * computed 仅跟踪 documentInfo.id / knowledge_id；改 name 不会重算。
 * 若 documentInfo 整对象替换导致重算，每次都会 new collaboration 对象 → useCollaboration 全量重建。
 */
export function useWordEditorProps(options: {
  documentInfo: Ref<DocumentItem>
  userInfo: Ref<UserInfo>
  fetchDocContextUsers: (documentId: string, query: string) => Promise<UserInfo[]>
}) {
  const { documentInfo, userInfo, fetchDocContextUsers } = options

  return computed(() => {
    const baseUrl = import.meta.env.VITE_APP_PROXY_URL + apiVersion
    return {
      collaboration: {
        documentId: documentInfo.value.id,
        url: import.meta.env.VITE_APP_COLLABORATE_URL + '/collaboration' + '?knowledgeId=' + documentInfo.value.knowledge_id,
        token: window.localStorage.getItem('access_token') as string,
        user: userInfo.value,
      },
      ai: {
        doubao: {
          url: baseUrl + '/ai/doubao/stream',
          header: {
            Authorization: `Bearer ${window.localStorage.getItem('access_token')}`,
          },
          bodyParams: (action: string, content: string, customPrompt: string): Record<string, any> => ({
            action,
            content,
            customPrompt,
          }),
        },
      },
      mentionUserFetch: async (query: string) => {
        return await fetchDocContextUsers(documentInfo.value.id, query)
      },
    }
  })
}
