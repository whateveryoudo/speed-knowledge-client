import { computed, type Ref } from 'vue'
import { apiVersion } from '@sk/api'
import type { DocumentItem } from '@sk/types'
import type { UserInfo } from '@sk/types'

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
