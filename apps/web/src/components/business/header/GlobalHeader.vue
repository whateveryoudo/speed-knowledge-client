<template>
  <header
    class="h-[50px] w-full bg-white border-0 border-b border-solid border-[var(--sd-border-primary)] px-4 flex items-center justify-between select-none shrink-0"
  >
    <!-- 左侧：Logo、空间切换与工作台导航 -->
    <div class="flex items-center gap-2 min-w-0">
      <router-link to="/dashboard" class="flex items-center gap-2 shrink-0">
        <img :src="Logo" alt="logo" class="w-[28px] h-auto object-contain" />
      </router-link>

      <SpaceSwitcher />

      <div class="w-px h-[16px] bg-[var(--sd-border-primary)] mx-1" />

      <router-link
        to="/dashboard"
        class="px-2.5 py-1 rounded-[6px] text-[14px] text-[var(--sd-text-body)] hover:text-[var(--sd-text-primary)] hover:bg-[var(--sd-bg-primary-hover)] cursor-pointer transition-colors font-medium decoration-none"
      >
        工作台
      </router-link>
    </div>

    <!-- 右侧：消息通知与个人中心 -->
    <div class="flex items-center gap-2 shrink-0">
      <a-badge
        :dot="unreadNotificationCount > 0"
        :offset="[-6, 7]"
        :number-style="{ backgroundColor: 'var(--sd-link-color)' }"
        @click="toggleNotificationModalVisible()"
      >
        <a-button type="text" class="shadow-btn-wrapper w-[32px] h-[32px]! p-0 flex items-center justify-center">
          <BellOutlined class="text-[16px]" />
        </a-button>
      </a-badge>

      <UserSetting />
    </div>

    <!-- 消息中心弹窗 -->
    <NotificationModal v-model:visible="notificationModalVisible" />
  </header>
</template>

<script setup lang="ts">
import { BellOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { useToggle } from '@vueuse/core'
import Logo from '#sk-web/assets/logo.png'
import SpaceSwitcher from '#sk-web/components/business/space/SpaceSwitcher.vue'
import UserSetting from '#sk-web/components/business/user/UserSetting.vue'
import NotificationModal from '#sk-web/components/business/notification/NotificationModal.vue'
import { useSystemStore } from '#sk-web/store/useSystemStore'

const systemStore = useSystemStore()
const { unreadNotificationCount } = storeToRefs(systemStore)
const [notificationModalVisible, toggleNotificationModalVisible] = useToggle(false)
</script>

<style scoped>
.shadow-btn-wrapper {
  color: var(--sd-text-caption);
  transition: all 0.2s ease;
}
.shadow-btn-wrapper:hover {
  color: var(--sd-text-primary);
  background-color: var(--sd-bg-primary-hover);
}
</style>

