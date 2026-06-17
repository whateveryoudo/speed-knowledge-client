<template>
  <div class="flex flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-[var(--sd-text-grey-900)]">知识库</h1>
      <div class="flex items-center gap-3">
        <a-input-search
          v-model:value="keyword"
          class="w-[220px]"
          placeholder="搜索知识库"
          allow-clear
          @search="handleSearch"
        />
        <a-button type="primary" @click="openAddKnowledge = true">
          <template #icon>
            <PlusOutlined />
          </template>
          新建知识库
        </a-button>
      </div>
    </div>

    <CommonPin />

    <div class="w-fit">
      <a-segmented v-model:value="activeModuleKey" :options="tabOptions" />
    </div>

    <PersonalList
      v-if="activeModuleKey === 'personal'"
      ref="personalListRef"
      :keyword="keyword"
    />
    <CollaborateList
      v-else
      ref="collaborateListRef"
      :keyword="keyword"
    />

    <AddKnowledge
      :open="openAddKnowledge"
      @update:open="(v: boolean) => (openAddKnowledge = v)"
      @ok="onKnowledgeCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import CommonPin from './components/CommonPin.vue'
import PersonalList from './personal/PersonalList.vue'
import CollaborateList from './collaborate/CollaborateList.vue'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'

const activeModuleKey = ref<'personal' | 'collaborate'>('personal')
const keyword = ref('')
const openAddKnowledge = ref(false)
const personalListRef = ref<InstanceType<typeof PersonalList> | null>(null)
const collaborateListRef = ref<InstanceType<typeof CollaborateList> | null>(null)

const tabOptions = [
  { label: '我个人的', value: 'personal' },
  { label: '邀请协作的', value: 'collaborate' },
]

const handleSearch = () => {
  if (activeModuleKey.value === 'personal') {
    personalListRef.value?.refresh()
  } else {
    collaborateListRef.value?.refresh()
  }
}

const onKnowledgeCreated = () => {
  if (activeModuleKey.value === 'personal') {
    personalListRef.value?.refresh()
  }
}
</script>
