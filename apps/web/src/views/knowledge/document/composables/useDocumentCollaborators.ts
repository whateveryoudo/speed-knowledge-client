import { ref } from 'vue'
import type { Collaborator } from '@sk/types'

/** 协同在线人员（顶部头像条 + 编辑器 awareness 共用） */
export function useDocumentCollaborators() {
  const collaborating_persons = ref<Collaborator[]>([])

  const handleCollaboratorsChange = (collaborators: Collaborator[]) => {
    collaborating_persons.value = collaborators
  }

  const resetCollaborators = () => {
    collaborating_persons.value = []
  }

  return {
    collaborating_persons,
    handleCollaboratorsChange,
    resetCollaborators,
  }
}
