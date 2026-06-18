<template>
  <div class="flex flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-[var(--sd-text-grey-900)]">知识库</h1>
    </div>

    <CommonPin />
    <a-flex justify="space-between" align="center">
      <div class="w-fit">
        <a-segmented v-model:value="activeModuleKey" :options="tabOptions" />
      </div>
      <div class="flex items-center gap-3">
        <a-input v-model:value="keyword" @input="handleSearch" class="w-[220px]" placeholder="搜索知识库" allow-clear>
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button @click="openAddKnowledge = true">
          <template #icon>
            <PlusOutlined />
          </template>
          新建知识库
        </a-button>
        <a-space :size="0">
          <template #split>
            <a-divider type="vertical" class="mx-1" />
          </template>
          <a-tooltip title="分组视图">
            <a-button type="text" @click="viewType = 'group'"
              :class="['shadow-btn-wrapper', viewType === 'group' ? 'is-active' : '']">
              <template #icon>
                <AppstoreOutlined />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="列表视图">
            <a-button type="text" @click="viewType = 'list'"
              :class="['shadow-btn-wrapper', viewType === 'list' ? 'is-active' : '']">
              <template #icon>
                <MenuOutlined />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </div>
    </a-flex>


    <PersonalGroupList v-if="activeModuleKey === 'personal' && viewType === 'group'" ref="personalGroupListRef"
      :keyword="keyword" />
    <PersonalList v-else-if="activeModuleKey === 'personal'" ref="personalListRef" :keyword="keyword" />
    <CollaborateList v-else ref="collaborateListRef" :keyword="keyword" />

    <AddKnowledge :open="openAddKnowledge" @update:open="(v: boolean) => (openAddKnowledge = v)"
      @ok="onKnowledgeCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusOutlined, AppstoreOutlined, MenuOutlined } from '@ant-design/icons-vue'
import CommonPin from './components/CommonPin.vue'
import PersonalList from './personal/PersonalList.vue'
import PersonalGroupList from './personal/PersonalGroupList.vue'
import CollaborateList from './collaborate/CollaborateList.vue'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'
import { debounce } from 'lodash-es'

const KNOWLEDGE_MAIN_MODULE_KEY = 'sk_knowledge_main_module'
const KNOWLEDGE_MAIN_VIEW_TYPE_KEY = 'sk_knowledge_main_view_type'

const readActiveModuleKey = (): 'personal' | 'collaborate' => {
  const stored = localStorage.getItem(KNOWLEDGE_MAIN_MODULE_KEY)
  return (stored as 'personal' | 'collaborate') || 'personal'
}

const readViewType = (): 'group' | 'list' => {
  const stored = localStorage.getItem(KNOWLEDGE_MAIN_VIEW_TYPE_KEY)
  return (stored as 'group' | 'list') || 'group'
}

const activeModuleKey = ref<'personal' | 'collaborate'>(readActiveModuleKey())
const keyword = ref('')
const openAddKnowledge = ref(false)
const personalListRef = ref<InstanceType<typeof PersonalList> | null>(null)
const personalGroupListRef = ref<InstanceType<typeof PersonalGroupList> | null>(null)
const collaborateListRef = ref<InstanceType<typeof CollaborateList> | null>(null)

const tabOptions = [
  { label: '我个人的', value: 'personal' },
  { label: '邀请协作的', value: 'collaborate' },
]

const viewType = ref<'group' | 'list'>(readViewType())

watch(activeModuleKey, (value) => {
  localStorage.setItem(KNOWLEDGE_MAIN_MODULE_KEY, value)
})

watch(viewType, (value) => {
  localStorage.setItem(KNOWLEDGE_MAIN_VIEW_TYPE_KEY, value)
})

const handleSearch = debounce(() => {
  if (activeModuleKey.value === 'personal') {
    if (viewType.value === 'group') {
      personalGroupListRef.value?.refresh()
    } else {
      personalListRef.value?.refresh()
    }
  } else {
    collaborateListRef.value?.refresh()
  }
}, 300)

const onKnowledgeCreated = () => {
  if (activeModuleKey.value === 'personal') {
    if (viewType.value === 'group') {
      personalGroupListRef.value?.refresh()
    } else {
      personalListRef.value?.refresh()
    }
  }
}
</script>
