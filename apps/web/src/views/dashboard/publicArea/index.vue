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

    <CommonPin />

    <a-flex justify="space-between" align="center">
      <div class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">
        所有分组
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
      </div>
    </a-flex>

    <!-- 公共区通用分组列表 -->
    <KnowledgeGroupList
      ref="groupListRef"
      scope-type="space"
      :keyword="keyword"
      @knowledge-created="onKnowledgeCreated"
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
import { ref } from 'vue'
import { PlusOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import CommonPin from '../knowledgeMain/components/CommonPin.vue'
import KnowledgeGroupList from '../components/knowledgeGroupList/index.vue'
import AddKnowledge from '../components/addMenu/AddKnowledge.vue'

const keyword = ref('')
const openAddKnowledge = ref(false)
const groupListRef = ref<InstanceType<typeof KnowledgeGroupList> | null>(null)

const handleSearch = debounce(() => {
  groupListRef.value?.refresh()
}, 300)

const handleActionMenuClick = ({ key }: { key: string | number }) => {
  if (key === 'knowledge') {
    openAddKnowledge.value = true
  } else if (key === 'group') {
    groupListRef.value?.createGroup()
  }
}

const onKnowledgeCreated = () => {
  groupListRef.value?.refresh()
}
</script>
