<template>
  <div class="team-menus my-1">
    <!-- 展开态：团队菜单项 + 可折叠团队列表 (Image 1) -->
    <div class="px-2" v-if="expanded">
      <div
        class="team-header flex items-center rounded-[6px] h-[36px] pl-1 pr-3 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
        :class="{ 'bg-[var(--sd-bg-primary-hover)]': route.path === '/dashboard/team' }"
        @click="router.push('/dashboard/team')"
      >
        <a-button
          type="text"
          class="shadow-btn-wrapper mr-1 text-[var(--sd-grey-7)] hover:text-[var(--sd-text-grey-900)] p-0 w-[20px] h-[20px] flex items-center justify-center"
          @click.stop="toggleInner"
        >
          <span class="transition-transform duration-200 text-[11px]" :class="{ 'rotate-90': innerExpanded }">
            <CaretRightOutlined />
          </span>
        </a-button>
        <span class="text-[var(--sd-text-grey-900)] font-medium text-[14px]">团队</span>
        <span class="ml-auto">
          <RightOutlined class="text-[12px] text-[var(--sd-text-grey-900)] opacity-60" />
        </span>
      </div>

      <Collapse :when="innerExpanded" class="team-list">
        <div v-if="loading" class="py-2 text-center text-[var(--sd-text-caption)] text-[12px]">
          加载中...
        </div>
        <div v-else-if="teams.length > 0" class="flex flex-col py-1 pl-4 gap-0.5">
          <div
            v-for="team in teams"
            :key="team.id"
            class="flex items-center gap-2 h-[32px] px-2 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-colors"
            :class="{
              'bg-[var(--sd-bg-primary-hover)] font-medium': route.path === `/dashboard/team/${team.slug}`,
            }"
            @click="router.push(`/dashboard/team/${team.slug}`)"
          >
            <div class="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded text-[#1677ff]">
              <TeamOutlined class="text-[13px]" />
            </div>
            <span class="truncate text-[13px] text-[var(--sd-text-grey-900)] flex-1">
              {{ team.name }}
            </span>
            <LockOutlined
              v-if="team.visibility !== TeamVisibility.PUBLIC"
              class="text-[11px] text-[var(--sd-text-caption)] shrink-0"
            />
          </div>
        </div>
        <p v-else class="text-[var(--sd-text-caption)] text-center text-[12px] py-2 m-0">
          暂无团队
        </p>
      </Collapse>
    </div>

    <!-- 收起态：悬浮气泡 -->
    <template v-else>
      <a-popover placement="rightTop">
        <template #content>
          <div class="w-[200px]">
            <div
              class="flex items-center h-[32px] px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-colors rounded-[6px]"
              @click="router.push('/dashboard/team')"
            >
              <span class="text-[var(--sd-text-grey-900)] font-medium">团队</span>
              <span class="ml-auto">
                <RightOutlined class="text-[12px] text-[var(--sd-text-grey-900)] opacity-60" />
              </span>
            </div>
            <div class="flex flex-col py-1 gap-1">
              <div
                v-for="team in teams"
                :key="team.id"
                class="flex items-center gap-2 h-[30px] px-2 rounded-[4px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] text-[13px]"
                @click="router.push(`/dashboard/team/${team.slug}`)"
              >
                <TeamOutlined class="text-[#1677ff] text-[12px]" />
                <span class="truncate flex-1">{{ team.name }}</span>
                <LockOutlined
                  v-if="team.visibility !== TeamVisibility.PUBLIC"
                  class="text-[11px] text-[var(--sd-text-caption)]"
                />
              </div>
            </div>
          </div>
        </template>
        <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]! flex items-center justify-center mx-auto">
          <TeamOutlined class="text-18px" />
        </a-button>
      </a-popover>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  CaretRightOutlined,
  RightOutlined,
  TeamOutlined,
  LockOutlined,
} from '@ant-design/icons-vue'
import { Collapse } from 'vue-collapsed'
import to from 'await-to-js'
import { team as teamApi } from '@sk/api'
import { TeamVisibility, type TeamListItem } from '@sk/types'

const props = withDefaults(
  defineProps<{
    expanded?: boolean
  }>(),
  {
    expanded: true,
  },
)

const router = useRouter()
const route = useRoute()
const innerExpanded = ref(true)
const teams = ref<TeamListItem[]>([])
const loading = ref(false)

const toggleInner = () => {
  innerExpanded.value = !innerExpanded.value
}

const fetchTeams = async () => {
  loading.value = true
  const [error, res] = await to(teamApi.getMyTeamList())
  loading.value = false
  if (!error && res.data) {
    teams.value = res.data
  }
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
.team-menus {
  user-select: none;
}
</style>
