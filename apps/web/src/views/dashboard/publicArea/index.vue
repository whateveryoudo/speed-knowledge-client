<template>
  <div class="flex flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-[20px] font-semibold text-[var(--sd-text-grey-900)] mb-1">
          公共区
        </h1>
        <p class="text-[13px] text-[var(--sd-text-caption)] m-0">
          空间全体成员均可查阅与访问的公共知识库
        </p>
      </div>
    </div>

    <a-flex justify="space-between" align="center">
      <div class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">
        {{ viewType === 'group' ? '所有分组' : '所有知识库' }}
      </div>
      <div class="flex items-center gap-3">
        <a-input
          v-model:value="keyword"
          class="w-[220px]"
          placeholder="搜索知识库"
          allow-clear
          @input="handleSearch"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>

        <!-- 新建下拉菜单 -->
        <a-dropdown :trigger="['click']" placement="bottomRight">
          <a-button type="primary" class="flex items-center gap-1">
            <template #icon>
              <PlusOutlined />
            </template>
            新建
            <DownOutlined class="text-[10px]" />
          </a-button>
          <template #overlay>
            <a-menu @click="handleActionMenuClick">
              <a-menu-item key="knowledge">
                新建知识库
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="group">
                新建分组
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- 视图切换：分组视图 / 列表视图 -->
        <a-space :size="0">
          <template #split>
            <a-divider type="vertical" class="mx-1" />
          </template>
          <a-tooltip title="分组视图">
            <a-button
              type="text"
              @click="viewType = 'group'"
              :class="['shadow-btn-wrapper', viewType === 'group' ? 'is-active' : '']"
            >
              <template #icon>
                <AppstoreOutlined />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="列表视图">
            <a-button
              type="text"
              @click="viewType = 'list'"
              :class="['shadow-btn-wrapper', viewType === 'list' ? 'is-active' : '']"
            >
              <template #icon>
                <MenuOutlined />
              </template>
            </a-button>
          </a-tooltip>
        </a-space>
      </div>
    </a-flex>

    <!-- 分组视图 -->
    <KnowledgeGroupList
      v-if="viewType === 'group'"
      ref="groupListRef"
      scope-type="space"
      :keyword="keyword"
      @knowledge-created="onKnowledgeCreated"
    />

    <!-- 列表视图 -->
    <PublicAreaKnowledgeList
      v-else
      ref="listRef"
      :keyword="keyword"
    />

    <!-- 新建知识库弹窗 -->
    <AddKnowledge
      :open="openAddKnowledge"
      @update:open="(v: boolean) => (openAddKnowledge = v)"
      @ok="onKnowledgeCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  PlusOutlined,
  DownOutlined,
  SearchOutlined,
  AppstoreOutlined,
  MenuOutlined,
} from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import KnowledgeGroupList from '../components/knowledgeGroupList/index.vue'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'
import PublicAreaKnowledgeList from './components/PublicAreaKnowledgeList.vue'

const PUBLIC_AREA_VIEW_TYPE_KEY = 'sk_public_area_view_type'

const readInitialViewType = (): 'group' | 'list' => {
  const stored = localStorage.getItem(PUBLIC_AREA_VIEW_TYPE_KEY)
  return stored === 'list' ? 'list' : 'group'
}

const keyword = ref('')
const viewType = ref<'group' | 'list'>(readInitialViewType())
const openAddKnowledge = ref(false)
const groupListRef = ref<InstanceType<typeof KnowledgeGroupList> | null>(null)
const listRef = ref<InstanceType<typeof PublicAreaKnowledgeList> | null>(null)

watch(viewType, (v) => {
  localStorage.setItem(PUBLIC_AREA_VIEW_TYPE_KEY, v)
})

const handleSearch = debounce(() => {
  if (viewType.value === 'group') {
    groupListRef.value?.refresh()
  } else {
    listRef.value?.refresh()
  }
}, 300)

const handleActionMenuClick = async ({ key }: { key: string | number }) => {
  if (key === 'knowledge') {
    openAddKnowledge.value = true
  } else if (key === 'group') {
    if (viewType.value !== 'group') {
      viewType.value = 'group'
      await nextTick()
    }
    groupListRef.value?.createGroup()
  }
}

const onKnowledgeCreated = () => {
  groupListRef.value?.refresh()
  listRef.value?.refresh()
}
</script>
