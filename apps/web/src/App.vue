<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, type App } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SiteBeian from './components/SiteBeian.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useSpaceStore } from './store/useSpaceStore'
import SpeedComponents from 'speed-components-ui/components'
dayjs.locale('zh-cn')
// 初始化空间信息

const { initSpace } = useSpaceStore()
// 初始化主题配置（这里主要动态更新speed-components的相关主题）
import { theme } from 'ant-design-vue';
const { useToken } = theme;
const { token } = useToken();
// 在 setup 的同步部分获取 app 实例
const instance = getCurrentInstance()
const app = instance?.appContext.app as App
initSpace()

const route = useRoute()
const showSiteBeian = computed(() => {
  if (route.path === '/login') return true
  if (route.path.includes('/invite')) return true
  return route.matched.some((record) => record.meta.guestEntry)
})

onMounted(async () => {
  await nextTick();
  SpeedComponents.updateTheme(app, {
    token: token.value,
  })
})


</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{
    token: {
      colorPrimary: '#00b96b',
    },
  }">
    <RouterView />
    <SiteBeian v-if="showSiteBeian" />
  </a-config-provider>
</template>

<style scoped></style>
