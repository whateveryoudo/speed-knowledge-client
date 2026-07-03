<template>
  <s-full-modal width="720px" :open="open" :title="null" :footer="null" :closable="false" :maskClosable="true"
    :destroy-on-close="true" wrap-class-name="search-modal-shell" @cancel="handleOpenChange(false)"
    @update:open="handleOpenChange">
    <a-flex vertical class="max-h-[70vh]">
      <a-flex align="center" :gap="10" class="px-4 py-3.5 border-b border-solid border-[var(--sd-border-light)]">
        <SearchOutlined class="shrink-0 text-16px text-[var(--ant-color-text-tertiary)]" />
        <a-input ref="inputRef" v-model:value="keyword" :bordered="false" allow-clear
          :placeholder="knowledgeName ? `在 ${knowledgeName} 中搜索` : '搜索当前知识库内的文档'" class="flex-1! text-15px"
          @keydown.esc="handleOpenChange(false)" />
      </a-flex>

      <div class="flex-1 min-h-[280px] max-h-[calc(70vh-56px)] overflow-y-auto"
        :class="displayLoading ? 'flex items-center justify-center' : ''">
        <a-spin :spinning="displayLoading">
          <section v-if="displayDocumentItems.length">
            <div v-if="isKeywordMode" class="px-4 pt-2.5 pb-1 text-12px leading-20px text-[var(--sd-text-tertiary)]">
              文档
            </div>
            <div class="px-2">

              <SearchResultItem v-for="item in displayDocumentItems" :key="`${item.slug}-${item.id}`" :title="item.name"
                :icon-type="getDocumentIcon(item)" :keyword="isKeywordMode ? keyword : ''"
                @select="handleSelectDocument(item)" />
            </div>

          </section>

          <Empty0 v-if="!displayLoading && !displayDocumentItems.length" class="py-16!"
            :description="emptyDescription" />
        </a-spin>
      </div>
    </a-flex>
  </s-full-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import { documentTypeOptions, type DocumentNodeTreeItem } from '@sk/types'
import SearchResultItem from './SearchResultItem.vue'
import { useSearch, type FlatDocumentItem } from './useSearch'

const props = defineProps<{
  open: boolean
  knowledgeId: string
  knowledgeName?: string
  knowledgeSlug?: string
  teamSlug?: string
  documentTree?: DocumentNodeTreeItem[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const inputRef = ref<{ focus: () => void } | null>(null)
const openRef = toRef(props, 'open')
const knowledgeIdRef = toRef(props, 'knowledgeId')
const knowledgeNameRef = toRef(props, 'knowledgeName')
const knowledgeSlugRef = toRef(props, 'knowledgeSlug')
const teamSlugRef = toRef(props, 'teamSlug')
const documentTreeRef = toRef(props, 'documentTree')

const { keyword, isKeywordMode, displayDocumentItems, displayLoading } = useSearch({
  context: 'knowledge',
  open: openRef,
  knowledgeId: knowledgeIdRef,
  knowledgeName: knowledgeNameRef,
  knowledgeSlug: knowledgeSlugRef,
  teamSlug: teamSlugRef,
  documentTree: documentTreeRef,
})

const emptyDescription = computed(() =>
  isKeywordMode.value ? '未找到匹配文档' : '暂无文档',
)

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}

const getDocumentIcon = (item: FlatDocumentItem) => {
  return documentTypeOptions.find((opt) => opt.value === item.type)?.icon ?? 'icon-document'
}

const handleSelectDocument = (item: FlatDocumentItem) => {
  const teamSlug = props.teamSlug
  const knowledgeSlug = props.knowledgeSlug
  if (!teamSlug || !knowledgeSlug) return
  handleOpenChange(false)
  router.push(`/${teamSlug}/knowledge/${knowledgeSlug}/document/${item.slug}`)
}

watch(
  () => props.open,
  (visible) => {
    if (!visible) return
    nextTick(() => {
      inputRef.value?.focus?.()
    })
  },
)
</script>
