import { ref, reactive, type ComputedRef } from 'vue'
import { CollaboratorRole, CollaboratorStatus } from '@sk/types'
import { CollaboratorResourceType, InvitationStatus, type InvitationValidInfo } from '@sk/types'
import { to } from 'await-to-js'
import { collaborator as collaboratorApi } from '@sk/api'
import { useRouter } from 'vue-router'
import { useToggle } from '@vueuse/core'
import { message } from 'ant-design-vue'
interface IOptions {
  token: string
  resourceType: CollaboratorResourceType
  teamSlug: string
  knowledgeSlug: string
  documentSlug?: string
}
export const useInvite = (options: ComputedRef<IOptions>) => {
  const { token, resourceType, teamSlug, knowledgeSlug, documentSlug } = options.value
  const router = useRouter()
  const linkLosed = ref(false)
  const waitApproval = ref(false)
  const [loading, toggleLoading] = useToggle(false)
  const invitationValidInfo = reactive<InvitationValidInfo>({
    invitation: {
      status: InvitationStatus.ACTIVE,
      knowledge_name: '',
      knowledge_id: '',
      document_name: '',
      document_id: '',
      role: CollaboratorRole.READ,
      invitate_type: resourceType,
      need_approval: 0,
    },
    collaborator: null,
  })
  const handleInvitationValidInfo = (silent = false) => {
    if (invitationValidInfo.collaborator?.status === CollaboratorStatus.ACCEPTED) {
      if (resourceType === CollaboratorResourceType.KNOWLEDGE) {
        router.push(`/${teamSlug}/knowledge/${knowledgeSlug}`)
      } else if (resourceType === CollaboratorResourceType.DOCUMENT) {
        router.push(`/${teamSlug}/knowledge/${knowledgeSlug}/document/${documentSlug}`)
      }
    } else if (invitationValidInfo.collaborator?.status === CollaboratorStatus.PENDING) {
      if (!silent) {
        message.info('你已提交申请')
      }
      waitApproval.value = true
    }
  }
  const getInvitationValidLinkInfo = async () => {
    const [error, res] = await to(collaboratorApi.getInvitationValidLinkInfo(token))
    if (error) {
      if ((error as any).response.data.errCode === 400) {
        linkLosed.value = true
      }
      return
    }
    invitationValidInfo.invitation = res.data.invitation
    invitationValidInfo.collaborator = res.data.collaborator
    handleInvitationValidInfo()
  }
  const applyJoinKnowledge = async () => {
    if (invitationValidInfo.collaborator) {
      return
    }
    toggleLoading(true)
    const [error, res] = await to(collaboratorApi.applyJoinKnowledge({ invitation_token: token }))
    toggleLoading(false)
    if (error) {
      return
    }
    invitationValidInfo.collaborator = res.data
    handleInvitationValidInfo(true)
  }
  return {
    getInvitationValidLinkInfo,
    applyJoinKnowledge,
    loading,
    linkLosed,
    invitationValidInfo,
    waitApproval,
  }
}
