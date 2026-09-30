<script setup lang="ts">
import { ref } from 'vue'
import KnowledgeGroupList from '../../components/knowledgeGroupList/index.vue'

defineProps<{
  keyword: string
  teamId?: string
  teamSlug?: string
}>()

const listRef = ref<InstanceType<typeof KnowledgeGroupList> | null>(null)

defineExpose({
  refresh: () => listRef.value?.refresh(),
  createGroup: () => listRef.value?.createGroup(),
})
</script>

<template>
  <KnowledgeGroupList
    ref="listRef"
    v-bind="$attrs"
    :keyword="keyword"
    :team-id="teamId"
    :team-slug="teamSlug"
  />
</template>
