<template>
  <s-full-modal width="720px" :open="open" :title="null" :footer="null" :closable="false" :maskClosable="true"
    :destroy-on-close="true" wrap-class-name="search-modal-shell" @cancel="handleOpenChange(false)"
    @update:open="handleOpenChange">
    <a-flex vertical class="max-h-[70vh]">
      <a-flex align="center" :gap="10" class="px-4 py-3.5 border-b border-solid border-[var(--sd-border-light)]">
        <SearchOutlined class="shrink-0 text-16px text-[var(--ant-color-text-tertiary)]" />
        <a-input ref="inputRef" v-model:value="keyword" :bordered="false" allow-clear placeholder="搜索内容"
          class="flex-1! text-15px" @keydown.esc="handleOpenChange(false)" />
      </a-flex>

      <div class="px-2" v-if="isKeywordMode">
        
        <div
          class="menu-item-base flex items-center gap-2.5 h-[40px]! px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
          :class="visibility === 'related' ? 'bg-[var(--sd-bg-primary-hover)]' : ''"
          @click="switchVisibility('related')">
          在
          <strong class="mx-2 text-[var(--sd-text-primary)] font-semibold">与我相关</strong>
          搜索 "{{ trimmedKeyword }}"
        </div>
        <div
          class="menu-item-base flex items-center gap-2.5 h-[40px]! px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
          :class="visibility === 'public' ? 'bg-[var(--sd-bg-primary-hover)]' : ''" @click="switchVisibility('public')">
          在
          <strong class="mx-2 text-[var(--sd-text-primary)] font-semibold">公开文档</strong>
          搜索 "{{ trimmedKeyword }}"
        </div>
      </div>

      <div class="flex-1 min-h-[280px] max-h-[calc(70vh-56px)] overflow-y-auto"
        :class="displayLoading ? 'flex items-center justify-center' : ''" @scroll="handleScroll">
        <template v-if="isPublicPlaceholder">
          <Empty0 class="py-16!" description="公开文档搜索即将上线" />
        </template>

        <template v-else>
          <a-spin :spinning="displayLoading">
            <section v-if="displayKnowledgeItems.length">
              <div class="px-4  pt-2.5 pb-1 leading-20px text-[var(--sd-text-caption)]">
                知识库
              </div>
              <div class="px-2">
                <SearchResultItem v-for="item in displayKnowledgeItems" :key="item.id" :title="item.name"
                  icon-type="icon-book-0" :keyword="isKeywordMode ? keyword : ''" :show-lock="!item.is_public"
                  @select="handleSelectKnowledge(item)" />
              </div>
            </section>

            <section v-if="displayDocumentItems.length" :class="displayKnowledgeItems.length
              ? 'border-t border-solid border-[var(--sd-border-light)]'
              : ''
              ">
              <div class="px-4 pt-2.5 pb-1 leading-20px text-[var(--sd-text-caption)]">
                文档
              </div>
              <div class="px-2">

              <SearchResultItem v-for="item in displayDocumentItems"
                :key="`${item.slug}-${item.knowledge_slug ?? item.knowledge_id}`" :title="getDocumentTitle(item)"
                :subtitle="getDocumentSubtitle(item)" :icon-type="getDocumentIcon(item)" :keyword="keyword"
                @select="handleSelectDocument(item)" />
              </div>

            </section>

            <Empty0 v-if="
              !displayLoading &&
              !displayKnowledgeItems.length &&
              !displayDocumentItems.length
            " class="py-16!" :description="emptyDescription" />
          </a-spin>

          <a-flex v-if="listLoading && !displayLoading" justify="center" class="py-2 pb-3">
            <a-spin size="small" />
          </a-flex>
        </template>
      </div>
    </a-flex>
  </s-full-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined } from '@ant-design/icons-vue'
import {
  documentTypeOptions,
  type SearchDocumentItem,
  type SearchKnowledgeItem,
} from '@sk/types'
import SearchResultItem from './SearchResultItem.vue'
import {
  useSearch,
  type FlatDocumentItem,
} from './useSearch'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const router = useRouter()
const inputRef = ref<{ focus: () => void } | null>(null)
const openRef = computed(() => props.open)

const {
  keyword,
  visibility,
  isKeywordMode,
  isPublicPlaceholder,
  displayKnowledgeItems,
  displayDocumentItems,
  displayLoading,
  listLoading,
  handleScroll,
  switchVisibility,
} = useSearch({
  context: 'global',
  open: openRef,
})

const trimmedKeyword = computed(() => keyword.value.trim())

const emptyDescription = computed(() =>
  isKeywordMode.value ? '未找到匹配结果' : '暂无知识库',
)

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}

const getDocumentTitle = (item: SearchDocumentItem | FlatDocumentItem) => item.name

const getDocumentSubtitle = (item: SearchDocumentItem | FlatDocumentItem) => {
  const teamSlug = item.team_slug
  const knowledgeName =
    'knowledge_name' in item && item.knowledge_name ? item.knowledge_name : ''
  if (teamSlug && knowledgeName) return `${teamSlug} / ${knowledgeName}`
  return knowledgeName || ''
}

const getDocumentIcon = (item: SearchDocumentItem | FlatDocumentItem) => {
  const docType = 'type' in item ? item.type : undefined
  return documentTypeOptions.find((opt) => opt.value === docType)?.icon ?? 'icon-document'
}

const handleSelectKnowledge = (item: SearchKnowledgeItem) => {
  if (!item.team_slug) return
  handleOpenChange(false)
  router.push(`/${item.team_slug}/knowledge/${item.slug}`)
}

const handleSelectDocument = (item: SearchDocumentItem | FlatDocumentItem) => {
  const teamSlug = item.team_slug
  const knowledgeSlug = item.knowledge_slug
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
