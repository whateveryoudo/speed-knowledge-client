<template>
  <div class="team-detail-container flex flex-col h-full bg-[#fbfbfb]">
    <!-- 顶部团队导航头 (Image 1 & 4) -->
    <div class="team-header-bar flex items-center justify-between px-6 py-3 bg-white border-0 border-b border-solid border-[var(--sd-border-light)] shrink-0">
      <!-- 左侧：团队信息与 Tab 切换 -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <TeamAvatar
            :icon="teamDetail?.icon"
            :size="32"
            class="border border-solid border-[#f0f0f0]"
          />
          <span class="text-[16px] font-semibold text-[var(--sd-text-grey-900)]">
            {{ teamDetail?.name || '团队' }}
          </span>
          <LockOutlined
            v-if="teamDetail?.visibility !== TeamVisibility.PUBLIC"
            class="text-[12px] text-[var(--sd-text-caption)]"
          />
          <button
            type="button"
            class="star-btn border-none bg-transparent cursor-pointer text-[var(--sd-text-caption)] hover:text-[#faad14] p-0 flex items-center"
            @click="isStarred = !isStarred"
          >
            <StarFilled v-if="isStarred" class="text-[#faad14] text-[15px]" />
            <StarOutlined v-else class="text-[15px]" />
          </button>
        </div>

        <!-- 顶部 Tab 导航 -->
        <div class="team-nav-tabs flex items-center gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="tab-btn px-3 py-1.5 text-[14px] rounded-md border-none bg-transparent cursor-pointer transition-colors"
            :class="[
              activeTab === tab.key
                ? 'font-medium text-[var(--sd-text-grey-900)] bg-[var(--sd-bg-primary-hover)]'
                : 'text-[var(--sd-text-caption)] hover:text-[var(--sd-text-grey-900)]',
            ]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 右侧：设置按钮 -->
      <div class="flex items-center gap-2">
        <a-dropdown :trigger="['click']" placement="bottomRight">
          <a-button type="text" class="setting-btn">
            <template #icon>
              <SettingOutlined class="text-[16px] text-[var(--sd-text-caption)]" />
            </template>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="edit" @click="openEditModal = true">
                编辑团队信息
              </a-menu-item>
              <a-menu-item key="back" @click="router.push('/dashboard/team')">
                返回团队列表
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 主体内容滚动区 -->
    <div class="flex-1 overflow-y-auto p-6 w-full">
      <!-- Tab 1: 知识库 -->
      <div v-show="activeTab === 'knowledge'" class="flex flex-col gap-6">
        <!-- 管理员玩法 Banner (Image 1 & 4) -->
        <div class="admin-banner rounded-lg border border-dashed border-[#d9d9d9] bg-white px-5 py-3 text-center text-[13px] text-[var(--sd-text-caption)] flex items-center justify-center gap-3">
          <span>管理员可以添加自定义内容，向全体团队成员展示</span>
          <a href="javascript:void(0)" class="text-[#1677ff] hover:underline flex items-center gap-1">
            了解更多玩法
            <RightOutlined class="text-[10px]" />
          </a>
        </div>

        <!-- 知识库操作头部 -->
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-semibold text-[var(--sd-text-grey-900)] m-0">
            知识库
          </h2>

          <div class="flex items-center gap-3">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索"
              allow-clear
              class="w-[200px] rounded-md"
              @pressEnter="fetchKnowledgeGroups"
            >
              <template #prefix>
                <SearchOutlined class="text-[var(--sd-text-caption)]" />
              </template>
            </a-input>

            <!-- 新建下拉按钮 (新建知识库 / 新建分组) -->
            <a-dropdown :trigger="['click']" placement="bottomRight">
              <a-button
                class="rounded-md border border-solid border-[var(--ant-color-success)] text-[var(--ant-color-success)] hover:border-[var(--ant-color-success-hover)] hover:text-[var(--ant-color-success-hover)] hover:bg-[var(--ant-color-success-bg)] flex items-center gap-1.5 px-3 h-[32px] transition-colors"
              >
                <PlusOutlined class="text-[13px]" />
                <DownOutlined class="text-[10px]" />
              </a-button>
              <template #overlay>
                <a-menu class="min-w-[120px]" @click="handleActionMenuClick">
                  <a-menu-item key="knowledge" class="py-1.5 text-[13px]">
                    新建知识库
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="group" class="py-1.5 text-[13px]">
                    新建分组
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <!-- 视图模式切换 -->
            <div class="flex items-center border border-solid border-[var(--ant-color-border)] rounded-md bg-[var(--ant-color-bg-container)] p-0.5">
              <a-tooltip title="卡片视图">
                <a-button
                  type="text"
                  size="small"
                  class="view-toggle-btn"
                  :class="{ 'is-active': viewMode === 'card' }"
                  @click="viewMode = 'card'"
                >
                  <AppstoreOutlined />
                </a-button>
              </a-tooltip>
              <a-divider type="vertical" class="mx-0.5 h-[14px]" />
              <a-tooltip title="列表视图">
                <a-button
                  type="text"
                  size="small"
                  class="view-toggle-btn"
                  :class="{ 'is-active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <BarsOutlined />
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </div>

        <!-- 通用知识库分组列表（支持卡片/列表、拖拽、重命名、空分组占位等） -->
        <KnowledgeGroupList
          ref="groupListRef"
          :keyword="searchKeyword"
          :team-id="teamDetail?.id"
          :team-slug="teamSlug"
          @knowledge-created="handleKnowledgeCreated"
        />
      </div>

      <!-- Tab 2: 动态 (预备前端视图) -->
      <div v-show="activeTab === 'activities'" class="py-12 text-center text-[var(--sd-text-caption)] bg-white rounded-lg border border-solid border-[var(--sd-border-light)]">
        <p class="text-[14px]">暂无动态</p>
        <span class="text-[12px] text-[#bfbfbf]">团队成员的操作与发布动态将在此展示</span>
      </div>

      <!-- Tab 3: 话题 (预备前端视图) -->
      <div v-show="activeTab === 'topics'" class="py-12 text-center text-[var(--sd-text-caption)] bg-white rounded-lg border border-solid border-[var(--sd-border-light)]">
        <p class="text-[14px]">暂无话题讨论</p>
        <span class="text-[12px] text-[#bfbfbf]">可以在这里发起异步讨论与提案</span>
      </div>

      <!-- Tab 4: 成员 (按用户需求：默认展示自己) -->
      <div v-show="activeTab === 'members'" class="bg-white rounded-lg border border-solid border-[var(--sd-border-light)] p-5">
        <div class="flex items-center justify-between mb-4">
          <span class="text-[15px] font-semibold text-[var(--sd-text-grey-900)]">
            团队成员 ({{ teamDetail?.member_count ?? 1 }})
          </span>
        </div>
        <div class="flex items-center justify-between py-3 border-0 border-b border-solid border-[#f0f0f0]">
          <div class="flex items-center gap-3">
            <a-avatar class="!bg-[#1677ff]">{{ userStore.userInfo.username?.charAt(0).toUpperCase() }}</a-avatar>
            <div>
              <div class="text-[14px] font-medium text-[var(--sd-text-grey-900)]">
                {{ userStore.userInfo.username }}
              </div>
              <div class="text-[12px] text-[var(--sd-text-caption)]">
                {{ userStore.userInfo.email || '空间成员' }}
              </div>
            </div>
          </div>
          <a-tag color="blue">
            {{ teamDetail?.my_role === 'owner' ? '所有者' : '成员' }}
          </a-tag>
        </div>
      </div>
    </div>

    <!-- 编辑团队弹窗 -->
    <EditTeamModal
      v-model:open="openEditModal"
      :team="teamDetail"
      @success="fetchTeamDetail"
    />

    <!-- 新建知识库弹窗 -->
    <AddKnowledge
      :open="openAddKnowledge"
      :defaultTeamId="teamDetail?.id"
      @update:open="(v: boolean) => (openAddKnowledge = v)"
      @ok="handleKnowledgeCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  TeamOutlined,
  LockOutlined,
  StarOutlined,
  StarFilled,
  SettingOutlined,
  RightOutlined,
  SearchOutlined,
  PlusOutlined,
  DownOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ReadOutlined,
} from '@ant-design/icons-vue'
import to from 'await-to-js'
import dayjs from 'dayjs'
import { transformDatatimeToRecentText } from '@sk/utils'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamDetail, type KnowledgeGroupItem } from '@sk/types'
import { useUserStore } from '#sk-web/store/useUserStore'
import EditTeamModal from './components/EditTeamModal.vue'
import AddKnowledge from '../dashboard/components/addMenu/AddKnowledge.vue'
import TeamAvatar from './components/TeamAvatar.vue'
import KnowledgeGroupList from '../dashboard/components/knowledgeGroupList/index.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const teamSlug = ref(route.params.team_slug as string)
const teamDetail = ref<TeamDetail | null>(null)
const groupListRef = ref<InstanceType<typeof KnowledgeGroupList> | null>(null)
const searchKeyword = ref('')
const isStarred = ref(false)
const viewMode = ref<'card' | 'list'>('card')
const activeTab = ref<'knowledge' | 'activities' | 'topics' | 'members'>('knowledge')
const openEditModal = ref(false)
const openAddKnowledge = ref(false)

const tabs = [
  { key: 'knowledge', label: '知识库' },
  { key: 'activities', label: '动态' },
  { key: 'topics', label: '话题' },
  { key: 'members', label: '成员' },
]

const fetchTeamDetail = async () => {
  if (!teamSlug.value) return
  const [error, res] = await to(teamApi.getTeamDetail(teamSlug.value))
  if (!error && res.data) {
    teamDetail.value = res.data
  }
}

const handleActionMenuClick = ({ key }: { key: string | number }) => {
  if (key === 'knowledge') {
    openAddKnowledge.value = true
  } else if (key === 'group') {
    groupListRef.value?.createGroup()
  }
}

const handleKnowledgeCreated = () => {
  groupListRef.value?.refresh()
  fetchTeamDetail()
}

watch(
  () => route.params.team_slug,
  (newSlug) => {
    if (newSlug) {
      teamSlug.value = newSlug as string
      fetchTeamDetail()
    }
  },
)

onMounted(() => {
  fetchTeamDetail()
})
</script>

<style scoped>
.tab-btn {
  color: var(--sd-text-caption);
}

.view-toggle-btn {
  color: var(--sd-text-caption);
  padding: 2px 6px;
  height: 24px;
}

.view-toggle-btn.is-active {
  background-color: var(--sd-bg-primary-hover);
  color: var(--sd-text-grey-900);
}
</style>
