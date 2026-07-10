<template>
  <a-flex v-if="!documentError" vertical class="h-full">
    <a-flex
      justify="space-between"
      align="center"
      class="fixed bg-[#fff] z-10 right-0 top-0 h-[52px] pl-[14px] pr-[50px] border-b-solid border-b-[1px] border-b-[var(--sd-border-light)]"
      :style="{ left: showKnowledgeLeftPanel ? `${knowledgeSidebarWidth}px` : '0' }"
    >
      <span>
        <s-toggle-input
          v-if="canEditDoc"
          :text="documentInfo?.name || defaultTitle"
          :updateText="toggleInputChange"
        />
        <span v-else class="font-medium">{{ documentInfo?.name || defaultTitle }}</span>
      </span>
      <a-space>
        <CollaboratingPersonAvatars
          v-if="currentDocState?.mode === 'edit' && canEditDoc"
          :collaborators="collaborating_persons"
        />
        <CollaboratorAddPopver v-if="canShareDoc" />
        <a-tooltip v-if="canCollectDoc" title="收藏" class="mr-2">
          <a-button
            type="text"
            class="shadow-btn-wrapper"
            @click="handleCollect(documentInfo.has_collected, { identifier: documentInfo.id, resource_type: CollectResourceType.DOCUMENT, onSuccess: () => { documentInfo.has_collected = !documentInfo.has_collected; } })"
          >
            <StarFilled v-if="documentInfo.has_collected" style="font-size: 18px;color: var(--sd-yellow-6);" />
            <StarOutlined v-else style="font-size: 18px;" />
          </a-button>
        </a-tooltip>
        <DocumentShare v-if="canShareDoc" />
        <a-button v-if="currentDocState.mode !== 'edit' && canEditDoc" type="primary" @click="changeToEdit">编辑</a-button>
        <template v-if="currentDocState.mode === 'edit' && canEditDoc">
          <a-tooltip title="文档会自动更新到阅读页">
            <a-button @click="setPreviewMode">保存</a-button>
          </a-tooltip>
        </template>
      </a-space>
    </a-flex>

    <div class="pt-[52px]">
      <SkeletonList
        :loading="!knowledgeStore.showEditor"
        :style="!knowledgeStore.showEditor ? { padding: '20px 50px' } : {}"
      >
        <WordEditor
          v-if="isWordDocument && knowledgeStore.showEditor"
          :editor-key="editorKey"
          :content-json="documentContentJson"
          :editable="currentDocState.mode === 'edit' && canEditDoc"
          :title="documentInfo.name"
          :header-style="wordHeaderStyle"
          :main-style="wordMainStyle"
          :editor-props="wordEditorProps"
          @update:title="onWordTitleUpdate"
          @update:collaborators="handleCollaboratorsChange"
        />
        <SheetEditor
          v-else-if="isSheetDocument && knowledgeStore.showEditor"
          :editor-key="editorKey"
          :document-id="documentInfo.id"
          :knowledge-id="documentInfo.knowledge_id"
          :editable="currentDocState.mode === 'edit' && canEditDoc"
          :sheet-snapshot="documentSheetSnapshot"
          :collaboration-url="collaborationBaseUrl"
          :collaboration-token="collaborationToken"
          @update:collaborators="handleCollaboratorsChange"
        />
      </SkeletonList>
    </div>

    <a-flex class="w-[1000px] mx-auto text-[var(--sd-grey-7)]" v-if="isWordDocument && currentDocState.mode === 'preview'">
      <a-space :size="10">
        <a-tooltip :title="`更新时间于 ${dayjs(documentInfo.content_updated_at).format('YYYY-MM-DD HH:mm:ss')}`">
          <ClockCircleOutlined />
          {{ transformDatatimeToRecentText(documentInfo.content_updated_at) }}
        </a-tooltip>
        <a-tooltip :title="`文档浏览次数 ${documentInfo.view_count}`">
          <ReadOutlined />
          {{ documentInfo.view_count }}
        </a-tooltip>
      </a-space>
    </a-flex>
  </a-flex>
  <not-found v-else :title="documentError.errMessage" />
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue'
import { DocumentType } from '@sk/types'
import { ensureSheet } from '#sk-web/plugins/ensureEditors'
import { storeToRefs } from 'pinia'
import { useSystemStore } from '#sk-web/store/useSystemStore'
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore'
import { useUserStore } from '#sk-web/store/useUserStore'
import { StarOutlined, StarFilled } from '@ant-design/icons-vue'
import { transformDatatimeToRecentText, isLoggedIn } from '@sk/utils'
import CollaboratingPersonAvatars from '#sk-web/components/collaboratingPersons/index.vue'
import { useCollect } from '../hooks/useCollect'
import { CollectResourceType, DocumentAbility } from '@sk/types'
import { CollaboratorAddPopver, DocumentShare } from '../components/documentCollaborator'
import { usePersonSearch } from '#sk-web/components/personSearch/usePersonSearch'
import dayjs from 'dayjs'
import WordEditor from './editors/WordEditor.vue'
import SheetEditor from './editors/SheetEditor.vue'
import { useDocumentCollaborators } from './composables/useDocumentCollaborators'
import { useWordEditorProps } from './composables/useWordEditorProps'
import { useAbility } from '#sk-web/hooks/useAbility'

const { knowledgeSidebarWidth } = storeToRefs(useSystemStore())
const knowledgeStore = useKnowledgeStore()
const {
  documentInfo,
  currentDocState,
  documentContentJson,
  documentSheetSnapshot,
  showKnowledgeLeftPanel,
  documentError,
} = storeToRefs(knowledgeStore)
const { userInfo } = storeToRefs(useUserStore())
const { collaborating_persons, handleCollaboratorsChange, resetCollaborators } = useDocumentCollaborators()
const { handleCollect } = useCollect()
const { fetchDocContextUsers } = usePersonSearch()
const { canRef } = useAbility()
const canEditDoc = canRef(DocumentAbility.DOC_EDIT)
const canShareDoc = canRef(DocumentAbility.DOC_SHARE)
const canCollectDoc = computed(() => isLoggedIn())

const isWordDocument = computed(() => documentInfo.value.type === DocumentType.WORD)
const isSheetDocument = computed(() => documentInfo.value.type === DocumentType.SHEET)
const defaultTitle = computed(() => (isSheetDocument.value ? '无标题表格' : '无标题文档'))
const editorKey = computed(() => `${documentInfo.value.id}-${documentInfo.value.type}-${currentDocState.value.mode}`)
const collaborationBaseUrl = import.meta.env.VITE_APP_COLLABORATE_URL as string
const collaborationToken = window.localStorage.getItem('access_token') as string

const wordEditorProps = useWordEditorProps({
  documentInfo,
  userInfo,
  fetchDocContextUsers,
})

const wordHeaderStyle = computed(() => ({
  position: 'fixed' as const,
  top: '52px',
  left: `${knowledgeSidebarWidth.value}px`,
  right: '0',
  zIndex: 10,
}))

const wordMainStyle = computed(() => ({
  paddingTop: '40px',
}))

const toggleInputChange = (state: { text: string; flag: boolean }) => {
  knowledgeStore.handleUpdateDocumentName(documentInfo.value.id, state.text, 'outer', () => {
    state.flag = false
  })
}

const onWordTitleUpdate = (val: string) => {
  knowledgeStore.handleUpdateDocumentName(documentInfo.value.id, val, 'editor')
}

const changeToEdit = () => {
  knowledgeStore.updateNode(documentInfo.value.id, { mode: 'edit' })
}

const setPreviewMode = () => {
  knowledgeStore.updateNode(documentInfo.value.id, { mode: 'preview' })
  knowledgeStore.initDocumentDetail(false)
}

watch(
  () => currentDocState.value.id,
  (val: string) => {
    if (val) {
      resetCollaborators()
      knowledgeStore.initDocumentDetail()
    }
  },
  { immediate: true },
)

watch(
  () => documentInfo.value?.type,
  async (type) => {
    if (type === DocumentType.SHEET) {
      await ensureSheet()
    }
  },
  { immediate: true },
)
</script>

<style lang="less" scoped></style>
