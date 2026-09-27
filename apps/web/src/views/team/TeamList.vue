<template>
  <div class="team-list-container p-6 flex flex-col gap-5 max-w-[1400px] mx-auto">
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-[var(--sd-text-grey-900)] m-0">团队</h1>
      <div class="flex items-center gap-3">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索团队"
          allow-clear
          class="w-[220px] rounded-md"
        >
          <template #prefix>
            <SearchOutlined class="text-[var(--sd-text-caption)]" />
          </template>
        </a-input>
        <a-button type="primary" class="rounded-md !bg-[#2ba471] hover:!bg-[#248d61] border-none" @click="openCreateModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          新建团队
        </a-button>
      </div>
    </div>

    <!-- 常用团队卡片区域 -->
    <div v-if="pinnedTeams.length > 0" class="pinned-section rounded-lg bg-[var(--sd-bg-secondary)] p-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[13px] font-medium text-[var(--sd-text-caption)]">常用</span>
        <button
          type="button"
          class="flex items-center gap-1 text-[12px] text-[var(--sd-text-caption)] hover:text-[var(--sd-text-grey-900)] border-none bg-transparent cursor-pointer"
          @click="isPinnedCollapsed = !isPinnedCollapsed"
        >
          <span>{{ isPinnedCollapsed ? '展开' : '收起' }}</span>
          <UpOutlined :class="{ 'rotate-180': isPinnedCollapsed }" class="transition-transform duration-200 text-[10px]" />
        </button>
      </div>

      <div
        v-show="!isPinnedCollapsed"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <div
          v-for="team in pinnedTeams"
          :key="team.id"
          class="pinned-card group flex items-center gap-3 p-3 rounded-lg bg-white border border-solid border-[var(--sd-border-light)] hover:border-[var(--sd-border-grey-4)] hover:shadow-sm transition-all cursor-pointer"
          @click="goTeamDetail(team)"
        >
          <div class="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#e6f4ff] text-[#1677ff]">
            <TeamOutlined class="text-[18px]" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="truncate text-[14px] font-medium text-[var(--sd-text-grey-900)]">
                {{ team.name }}
              </span>
              <LockOutlined
                v-if="team.visibility !== TeamVisibility.PUBLIC"
                class="text-[11px] text-[var(--sd-text-caption)] shrink-0"
              />
            </div>
            <p v-if="team.description" class="mt-0.5 mb-0 truncate text-[12px] text-[var(--sd-text-caption)]">
              {{ team.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 全部团队表格 -->
    <div class="team-table-wrap rounded-lg bg-white border border-solid border-[var(--sd-border-light)] overflow-hidden">
      <a-table
        :columns="columns"
        :data-source="filteredTeams"
        :loading="loading"
        :pagination="false"
        row-key="id"
        class="team-custom-table"
        :custom-row="customRow"
      >
        <!-- 名称 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="flex items-center gap-2.5 py-1">
              <div class="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-md bg-[#e6f4ff] text-[#1677ff]">
                <TeamOutlined class="text-[16px]" />
              </div>
              <span class="font-medium text-[var(--sd-text-grey-900)] hover:text-[#1677ff] transition-colors cursor-pointer">
                {{ record.name }}
              </span>
              <LockOutlined
                v-if="record.visibility !== TeamVisibility.PUBLIC"
                class="text-[12px] text-[var(--sd-text-caption)]"
              />
            </div>
          </template>

          <!-- 简介 -->
          <template v-else-if="column.key === 'description'">
            <span class="text-[var(--sd-text-caption)] line-clamp-1">
              {{ record.description || '-' }}
            </span>
          </template>

          <!-- 成员 -->
          <template v-else-if="column.key === 'member_count'">
            <span class="text-[var(--sd-text-grey-900)]">
              {{ record.member_count ?? 1 }} 人
            </span>
          </template>

          <!-- 加入时间 -->
          <template v-else-if="column.key === 'created_at'">
            <span class="text-[var(--sd-text-caption)] text-[13px]">
              {{ formatTime(record.created_at) }}
            </span>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center justify-end gap-1" @click.stop>
              <!-- 置顶/常用切换按钮 -->
              <a-tooltip :title="isPinned(record.id) ? '取消常用' : '设为常用'">
                <a-button
                  type="text"
                  size="small"
                  class="pin-btn"
                  :class="{ 'is-pinned': isPinned(record.id) }"
                  @click.stop="togglePin(record.id)"
                >
                  <PushpinFilled v-if="isPinned(record.id)" class="text-[#1677ff]" />
                  <PushpinOutlined v-else class="text-[var(--sd-text-caption)] hover:text-[#1677ff]" />
                </a-button>
              </a-tooltip>

              <!-- 更多操作 -->
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button type="text" size="small" class="text-[var(--sd-text-caption)] hover:text-[var(--sd-text-grey-900)]">
                  <MoreOutlined />
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="enter" @click="goTeamDetail(record)">
                      进入团队
                    </a-menu-item>
                    <a-menu-item key="edit" @click="openEdit(record)">
                      编辑团队
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 创建团队弹窗 -->
    <CreateTeamModal
      v-model:open="openCreateModal"
      @success="handleCreateSuccess"
    />

    <!-- 编辑团队弹窗 -->
    <EditTeamModal
      v-model:open="openEditModal"
      :team="currentEditTeam"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
  LockOutlined,
  UpOutlined,
  PushpinOutlined,
  PushpinFilled,
  MoreOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import to from 'await-to-js'
import dayjs from 'dayjs'
import { transformDatatimeToRecentText } from '@sk/utils'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamListItem } from '@sk/types'
import CreateTeamModal from './components/CreateTeamModal.vue'
import EditTeamModal from './components/EditTeamModal.vue'

const router = useRouter()
const loading = ref(false)
const teams = ref<TeamListItem[]>([])
const searchKeyword = ref('')
const isPinnedCollapsed = ref(false)
const openCreateModal = ref(false)
const openEditModal = ref(false)
const currentEditTeam = ref<TeamListItem | null>(null)

// 常用团队本地缓存状态（待后端团队置顶接口完成后可平滑切换）
const PINNED_STORAGE_KEY = 'sk_pinned_team_ids'
const pinnedTeamIds = ref<string[]>(
  JSON.parse(localStorage.getItem(PINNED_STORAGE_KEY) || '[]'),
)

const savePinned = () => {
  localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedTeamIds.value))
}

const isPinned = (id: string) => pinnedTeamIds.value.includes(id)

const togglePin = (id: string) => {
  if (isPinned(id)) {
    pinnedTeamIds.value = pinnedTeamIds.value.filter((item) => item !== id)
    message.success('已取消常用')
  } else {
    pinnedTeamIds.value.push(id)
    message.success('已设为常用')
  }
  savePinned()
}

// 常用团队列表
const pinnedTeams = computed(() => {
  return teams.value.filter((t) => pinnedTeamIds.value.includes(t.id))
})

// 过滤后的团队列表
const filteredTeams = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return teams.value
  return teams.value.filter(
    (t) =>
      t.name.toLowerCase().includes(kw) ||
      (t.description && t.description.toLowerCase().includes(kw)),
  )
})

// 表格列定义
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    sorter: (a: TeamListItem, b: TeamListItem) => a.name.localeCompare(b.name),
  },
  {
    title: '简介',
    dataIndex: 'description',
    key: 'description',
    width: '35%',
  },
  {
    title: '成员',
    dataIndex: 'member_count',
    key: 'member_count',
    width: 120,
    sorter: (a: TeamListItem, b: TeamListItem) => (a.member_count ?? 1) - (b.member_count ?? 1),
  },
  {
    title: '加入时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    sorter: (a: TeamListItem, b: TeamListItem) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  },
  {
    title: '',
    key: 'action',
    width: 90,
  },
]

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '-'
  try {
    return transformDatatimeToRecentText(timeStr)
  } catch {
    return dayjs(timeStr).format('MM-DD HH:mm')
  }
}

const fetchTeams = async () => {
  loading.value = true
  const [error, res] = await to(teamApi.getMyTeamList())
  loading.value = false
  if (!error && res.data) {
    teams.value = res.data
  }
}

const goTeamDetail = (team: TeamListItem) => {
  router.push(`/dashboard/team/${team.slug}`)
}

const customRow = (record: TeamListItem) => {
  return {
    onClick: () => goTeamDetail(record),
    class: 'cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-colors',
  }
}

const openEdit = (team: TeamListItem) => {
  currentEditTeam.value = team
  openEditModal.value = true
}

const handleCreateSuccess = (newTeam: any) => {
  fetchTeams()
  if (newTeam?.slug) {
    router.push(`/dashboard/team/${newTeam.slug}`)
  }
}

const handleEditSuccess = () => {
  fetchTeams()
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
.team-custom-table :deep(.ant-table-thead > tr > th) {
  background-color: transparent;
  font-weight: 500;
  color: var(--sd-text-caption);
  border-bottom: 1px solid var(--sd-border-light);
}

.team-custom-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--sd-border-light);
}
</style>
