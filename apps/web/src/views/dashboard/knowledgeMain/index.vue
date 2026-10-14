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
        <!-- 只有个人空间才展示卡片/列表切换视图，团队空间仅使用列表视图 -->
        <a-space v-if="isPersonalSpace" :size="0">
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

    <!-- 个人空间下：个人的（卡片/列表）/ 邀请协作的（列表）-->
    <template v-if="isPersonalSpace">
      <PersonalGroupList v-if="activeModuleKey === 'personal' && viewType === 'group'" ref="personalGroupListRef"
        :keyword="keyword" />
      <PersonalList v-else-if="activeModuleKey === 'personal'" ref="personalListRef" :keyword="keyword" />
      <CollaborateList v-else ref="collaborateListRef" :keyword="keyword" />
    </template>

    <!-- 组织/团队空间下：来自团队的（列表）/ 邀请协作的（列表）-->
    <template v-else>
      <TeamKnowledgeList v-if="activeModuleKey === 'team'" ref="teamKnowledgeListRef" :keyword="keyword" />
      <CollaborateList v-else ref="collaborateListRef" :keyword="keyword" />
    </template>

    <AddKnowledge :open="openAddKnowledge" @update:open="(v: boolean) => (openAddKnowledge = v)"
      @ok="onKnowledgeCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PlusOutlined, AppstoreOutlined, MenuOutlined, SearchOutlined } from '@ant-design/icons-vue'
import CommonPin from './components/CommonPin.vue'
import PersonalList from './personal/PersonalList.vue'
import PersonalGroupList from './personal/PersonalGroupList.vue'
import TeamKnowledgeList from './team/TeamKnowledgeList.vue'
import CollaborateList from './collaborate/CollaborateList.vue'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { debounce } from 'lodash-es'

const spaceStore = useSpaceStore()
const isPersonalSpace = computed(() => spaceStore.isPersonalSpace)

const KNOWLEDGE_MAIN_MODULE_KEY = 'sk_knowledge_main_module'
const KNOWLEDGE_MAIN_VIEW_TYPE_KEY = 'sk_knowledge_main_view_type'

const tabOptions = computed(() => {
  if (isPersonalSpace.value) {
    return [
      { label: '我个人的', value: 'personal' },
      { label: '邀请协作的', value: 'collaborate' },
    ]
  }
  return [
    { label: '来自团队的', value: 'team' },
    { label: '邀请协作的', value: 'collaborate' },
  ]
})

const readActiveModuleKey = (): 'personal' | 'team' | 'collaborate' => {
  const stored = localStorage.getItem(KNOWLEDGE_MAIN_MODULE_KEY)
  if (isPersonalSpace.value) {
    return stored === 'collaborate' ? 'collaborate' : 'personal'
  }
  return stored === 'collaborate' ? 'collaborate' : 'team'
}

const readViewType = (): 'group' | 'list' => {
  const stored = localStorage.getItem(KNOWLEDGE_MAIN_VIEW_TYPE_KEY)
  return (stored as 'group' | 'list') || 'group'
}

type ModuleKey = 'personal' | 'team' | 'collaborate'
const activeModuleKey = ref<ModuleKey>(readActiveModuleKey())
const keyword = ref('')
const openAddKnowledge = ref(false)
const personalListRef = ref<InstanceType<typeof PersonalList> | null>(null)
const personalGroupListRef = ref<InstanceType<typeof PersonalGroupList> | null>(null)
const teamKnowledgeListRef = ref<InstanceType<typeof TeamKnowledgeList> | null>(null)
const collaborateListRef = ref<InstanceType<typeof CollaborateList> | null>(null)

const viewType = ref<'group' | 'list'>(readViewType())

watch(activeModuleKey, (value) => {
  localStorage.setItem(KNOWLEDGE_MAIN_MODULE_KEY, value)
})

watch(viewType, (value) => {
  localStorage.setItem(KNOWLEDGE_MAIN_VIEW_TYPE_KEY, value)
})

// 监听空间类型切换，自动矫正 activeModuleKey
watch(
  isPersonalSpace,
  (personal) => {
    if (personal && activeModuleKey.value === 'team') {
      activeModuleKey.value = 'personal'
    } else if (!personal && activeModuleKey.value === 'personal') {
      activeModuleKey.value = 'team'
    }
  },
  { immediate: true },
)

const handleSearch = debounce(() => {
  if (isPersonalSpace.value) {
    if (activeModuleKey.value === 'personal') {
      if (viewType.value === 'group') {
        personalGroupListRef.value?.refresh()
      } else {
        personalListRef.value?.refresh()
      }
    } else {
      collaborateListRef.value?.refresh()
    }
  } else {
    if (activeModuleKey.value === 'team') {
      teamKnowledgeListRef.value?.refresh()
    } else {
      collaborateListRef.value?.refresh()
    }
  }
}, 300)

const onKnowledgeCreated = () => {
  if (isPersonalSpace.value) {
    if (activeModuleKey.value === 'personal') {
      if (viewType.value === 'group') {
        personalGroupListRef.value?.refresh()
      } else {
        personalListRef.value?.refresh()
      }
    } else {
      collaborateListRef.value?.refresh()
    }
  } else {
    if (activeModuleKey.value === 'team') {
      teamKnowledgeListRef.value?.refresh()
    } else {
      collaborateListRef.value?.refresh()
    }
  }
}
</script>
