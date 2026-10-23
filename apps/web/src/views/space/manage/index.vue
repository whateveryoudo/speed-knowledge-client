<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- 左侧侧边栏 (256px，具有背景区分和右边框，对齐知识库管理) -->
    <aside class="basis-[256px] h-full shrink-0 flex flex-col p-[16px] bg-[var(--sd-grey-1)] border-0 border-r-[1px] border-solid border-[var(--sd-border-primary)] overflow-hidden select-none">
      <!-- 顶部返回空间导航 (对齐知识库管理) -->
      <div @click="goBackSpace" class="menu-item-base px-[2px]! hover:bg-[var(--sd-bg-primary-hover)] mb-2">
        <LeftOutlined class="text-[12px] text-[var(--sd-text-caption)]" />
        <span class="text-[var(--sd-text-caption)] truncate">返回空间</span>
      </div>

      <!-- 空间标识与名称 -->
      <div class="flex items-center gap-2.5 px-[4px] mt-1 mb-4">
        <div class="w-8 h-8 rounded-[6px] overflow-hidden border border-solid border-[var(--ant-color-border-secondary)] bg-[var(--sd-grey-2)] flex items-center justify-center shrink-0">
          <img
            v-if="currentSpaceIcon"
            :src="currentSpaceIcon"
            class="w-full h-full object-cover"
            alt="space icon"
          />
          <AppstoreOutlined v-else class="text-[16px] text-[var(--ant-color-primary)]" />
        </div>
        <div class="min-w-0 flex-1">
          <a-tooltip :title="currentSpaceName">
            <div class="text-[15px] font-semibold text-[var(--sd-text-primary)] truncate">
              {{ currentSpaceName }}
            </div>
          </a-tooltip>
        </div>
      </div>

      <!-- 导航菜单项列表 (统一使用 menu-item-base 与 vue-collapsed，极细半透明滚动条) -->
      <div class="flex-1 overflow-y-auto space-y-0.5 custom-thin-scrollbar pr-1">
        <template v-for="menu in menus" :key="menu.key">
          <!-- 具有二级菜单的折叠项 -->
          <div v-if="menu.children && menu.children.length > 0">
            <div
              @click="toggleCollapse(menu.key)"
              class="menu-item-base justify-between text-[var(--sd-text-body)] hover:bg-[var(--sd-bg-primary-hover)] hover:text-[var(--sd-text-primary)]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <component :is="menu.icon" class="text-[14px] text-[var(--sd-text-caption)] shrink-0" />
                <span class="truncate">{{ menu.title }}</span>
              </div>
              <DownOutlined
                class="text-[11px] text-[var(--sd-text-caption)] transition-transform duration-200"
                :class="{ '-rotate-90': !isExpanded(menu.key) }"
              />
            </div>

            <!-- 二级子菜单列表 (vue-collapsed 直接拉通，高度不变小) -->
            <Collapse :when="isExpanded(menu.key)">
              <div class="flex flex-col">
                <div
                  v-for="sub in menu.children"
                  :key="sub.key"
                  @click="handleSelect(sub.key)"
                  :class="[
                    'menu-item-base',
                    currentSelectedKey === sub.key
                      ? 'bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-primary)] font-medium'
                      : 'text-[var(--sd-text-body)] hover:bg-[var(--sd-bg-primary-hover)] hover:text-[var(--sd-text-primary)]'
                  ]"
                >
                  <span class="truncate pl-[24px]">{{ sub.title }}</span>
                </div>
              </div>
            </Collapse>
          </div>

          <!-- 普通一级单项 -->
          <div
            v-else
            @click="handleSelect(menu.key)"
            :class="[
              'menu-item-base justify-between',
              currentSelectedKey === menu.key
                ? 'bg-[var(--sd-bg-primary-hover)] text-[var(--sd-text-primary)] font-medium'
                : 'text-[var(--sd-text-body)] hover:bg-[var(--sd-bg-primary-hover)] hover:text-[var(--sd-text-primary)]'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <component :is="menu.icon" class="text-[14px] text-[var(--sd-text-caption)] shrink-0" />
              <span class="truncate">{{ menu.title }}</span>
            </div>
            <span v-if="menu.badge" class="text-[11px] px-1.5 py-0.2 rounded bg-gray-100 text-[var(--sd-text-caption)] scale-90 shrink-0">
              {{ menu.badge }}
            </span>
          </div>
        </template>
      </div>
    </aside>

    <!-- 右侧内容主区域 (纯白底，居中收拢对齐知识库管理) -->
    <main class="flex-1 h-full bg-white overflow-y-auto px-[36px] pt-[48px] pb-[48px]">
      <div class="max-w-[1120px] mx-auto h-full flex flex-col">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LeftOutlined,
  DownOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  TeamOutlined,
  ClusterOutlined,
  SafetyCertificateOutlined,
  AccountBookOutlined,
  SettingOutlined,
  BarChartOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { Collapse } from 'vue-collapsed'
import { storeToRefs } from 'pinia'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'
import AvatarDef from '#sk-web/assets/images/avatar_def.png'

const router = useRouter()
const route = useRoute()
const spaceStore = useSpaceStore()
const { spaceInfo } = storeToRefs(spaceStore)

const currentSpaceName = computed(() => {
  return spaceInfo.value?.name || '空间管理'
})

const currentSpaceIcon = computed(() => {
  return resolveSpaceIconUrl(spaceInfo.value?.icon, AvatarDef)
})

interface MenuItem {
  key: string
  title: string
  icon?: any
  badge?: string
  children?: { key: string; title: string }[]
}

const menus: MenuItem[] = [
  { key: 'overview', title: '空间总览', icon: DashboardOutlined },
  {
    key: 'contacts-group',
    title: '人员与权限',
    icon: TeamOutlined,
    children: [
      { key: 'contacts', title: '通讯录' },
      { key: 'permissions', title: '权限设置' },
      { key: 'admins', title: '管理员设置' },
    ],
  },
  { key: 'team', title: '团队管理', icon: ClusterOutlined },
  { key: 'security', title: '安全中心', icon: SafetyCertificateOutlined },
  { key: 'cost', title: '费用中心', icon: AccountBookOutlined },
  { key: 'settings', title: '空间设置', icon: SettingOutlined },
  { key: 'statistics', title: '统计', icon: BarChartOutlined, badge: '旗舰版' },
  { key: 'trash', title: '回收站', icon: DeleteOutlined },
]

// 默认展开人员与权限分组
const expandedKeys = ref<string[]>(['contacts-group'])

const isExpanded = (key: string) => expandedKeys.value.includes(key)

const toggleCollapse = (key: string) => {
  if (expandedKeys.value.includes(key)) {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== key)
  } else {
    expandedKeys.value.push(key)
  }
}

const currentSelectedKey = computed(() => {
  const pathParts = route.path.split('/')
  return pathParts[pathParts.length - 1] || 'contacts'
})

const handleSelect = (key: string) => {
  router.push(`/space/manage/${key}`)
}

const goBackSpace = () => {
  router.push('/dashboard/start')
}
</script>
