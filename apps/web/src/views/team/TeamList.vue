<template>
  <div class="flex flex-col gap-4 p-6">
    <!-- 顶部操作栏（对齐知识库主页结构） -->
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-semibold text-[var(--sd-text-grey-900)] m-0">团队</h1>
      <div class="flex items-center gap-3">
        <a-input
          v-model:value="searchKeyword"
          placeholder="搜索团队"
          allow-clear
          class="w-[220px]"
        >
          <template #suffix>
            <SearchOutlined class="text-[var(--sd-text-caption)]" />
          </template>
        </a-input>
        <a-button
          type="primary"
          class="!bg-[#2ba471] hover:!bg-[#248d61] border-none flex items-center"
          @click="openCreateModal = true"
        >
          <template #icon>
            <PlusOutlined />
          </template>
          新建团队
        </a-button>
      </div>
    </div>

    <!-- 团队列表表格（参考知识库列表 PersonalList 样式规范） -->
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="filteredTeams"
      :loading="loading"
      :pagination="false"
      class="team-table"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record }">
        <!-- 名称 -->
        <template v-if="column.key === 'name'">
          <div class="flex min-w-0 items-center gap-2.5 py-0.5">
            <TeamAvatar
              :icon="record.icon"
              :size="32"
              class="border border-solid border-[#f0f0f0]"
            />
            <span class="truncate font-medium text-[var(--sd-text-grey-900)] hover:text-[#1677ff] transition-colors">
              {{ record.name }}
            </span>
            <LockOutlined
              v-if="record.visibility !== TeamVisibility.PUBLIC"
              class="shrink-0 text-[12px] text-[var(--sd-grey-7)]"
            />
          </div>
        </template>

        <!-- 简介 -->
        <template v-else-if="column.key === 'description'">
          <span class="truncate text-[var(--sd-grey-7)] text-[14px]">
            {{ record.description || '-' }}
          </span>
        </template>

        <!-- 成员 -->
        <template v-else-if="column.key === 'member_count'">
          <span class="text-[var(--sd-text-grey-900)] text-[14px]">
            {{ record.member_count ?? 1 }} 人
          </span>
        </template>

        <!-- 加入时间 -->
        <template v-else-if="column.key === 'created_at'">
          <span class="text-[var(--sd-grey-7)] text-[14px]">
            {{ formatJoinTime(record.created_at) }}
          </span>
        </template>

        <!-- 操作栏（置顶 & 更多菜单） -->
        <template v-else-if="column.key === 'action'">
          <div class="flex items-center justify-end gap-3" @click.stop>
            <a-tooltip :title="isPinned(record.id) ? '移出常用' : '设为常用'">
              <span
                class="inline-flex cursor-pointer text-[14px] text-[var(--sd-grey-8)] hover:text-[var(--sd-link-color)] transition-colors"
                @click.stop="togglePin(record.id)"
              >
                <PushpinFilled v-if="isPinned(record.id)" class="text-[var(--sd-link-color)]" />
                <PushpinOutlined
                  v-else
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--sd-grey-7)]"
                />
              </span>
            </a-tooltip>
            <a-dropdown trigger="click">
              <a-button
                type="text"
                class="shadow-btn-wrapper icon opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop
              >
                <template #icon>
                  <MoreOutlined />
                </template>
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

      <!-- 空状态 -->
      <template #emptyText>
        <Empty0 has-top description="暂无团队" />
      </template>
    </a-table>

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
  PushpinOutlined,
  PushpinFilled,
  MoreOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import to from 'await-to-js'
import dayjs from 'dayjs'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamListItem } from '@sk/types'
import CreateTeamModal from './components/CreateTeamModal.vue'
import EditTeamModal from './components/EditTeamModal.vue'
import TeamAvatar from './components/TeamAvatar.vue'

const router = useRouter()
const loading = ref(false)
const teams = ref<TeamListItem[]>([])
const searchKeyword = ref('')
const openCreateModal = ref(false)
const openEditModal = ref(false)
const currentEditTeam = ref<TeamListItem | null>(null)

// 常用团队本地缓存（待后端接口提供后无缝对接）
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

// 表格列定义（参考知识库规范）
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: (a: TeamListItem, b: TeamListItem) => a.name.localeCompare(b.name),
  },
  {
    title: '简介',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    width: '35%',
  },
  {
    title: '成员',
    dataIndex: 'member_count',
    key: 'member_count',
    width: 140,
    sorter: (a: TeamListItem, b: TeamListItem) => (a.member_count ?? 1) - (b.member_count ?? 1),
  },
  {
    title: '加入时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    sorter: (a: TeamListItem, b: TeamListItem) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  },
  {
    title: '',
    key: 'action',
    width: 100,
    align: 'right' as const,
  },
]

// 友好时间格式化（昨天 17:35, 07-31 11:51，不带秒）
const formatJoinTime = (timeStr?: string) => {
  if (!timeStr) return '-'
  const target = dayjs(timeStr)
  const now = dayjs()
  if (now.isSame(target, 'day')) {
    return '今天 ' + target.format('HH:mm')
  }
  if (now.subtract(1, 'day').isSame(target, 'day')) {
    return '昨天 ' + target.format('HH:mm')
  }
  if (now.isSame(target, 'year')) {
    return target.format('MM-DD HH:mm')
  }
  return target.format('YYYY-MM-DD HH:mm')
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
    class: 'cursor-pointer group',
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
.team-table :deep(.ant-table-thead > tr > th) {
  background-color: transparent;
  font-weight: 500;
  color: var(--sd-text-caption);
  border-bottom: 1px solid var(--sd-border-light);
}

.team-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--sd-border-light);
}

.team-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: var(--sd-bg-primary-hover);
}
</style>
