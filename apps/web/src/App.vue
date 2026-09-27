<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, type App } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useFavicon, useTitle } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { theme } from 'ant-design-vue'
import { SpaceType } from '@sk/types'
import SiteBeian from './components/SiteBeian.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useSpaceStore } from './store/useSpaceStore'
import { resolveSpaceIconUrl } from './plugins/editorApis'
import SpeedComponents from 'speed-components-ui/components'

dayjs.locale('zh-cn')

const DEFAULT_FAVICON = '/favicon.ico'
const spaceStore = useSpaceStore()
const { spaceInfo } = storeToRefs(spaceStore)
const sysTitle = (import.meta.env.VITE_SYS_TITLE as string) || 'Speed Doc'
const isOrgSpace = computed(
  () => spaceInfo.value.type === SpaceType.ORGANIZATION && !!spaceInfo.value.name,
)

useTitle(computed(() => (isOrgSpace.value ? spaceInfo.value.name : sysTitle)))

/** 组织空间用空间 icon；否则回落默认 favicon */
useFavicon(
  computed(() =>
    isOrgSpace.value
      ? resolveSpaceIconUrl(spaceInfo.value.icon, DEFAULT_FAVICON)
      : DEFAULT_FAVICON,
  ),
)

spaceStore.initSpace()

const { useToken } = theme
const { token } = useToken()
const instance = getCurrentInstance()
const app = instance?.appContext.app as App

const route = useRoute()
const showSiteBeian = computed(() => {
  if (route.path === '/login') return true
  if (route.path.includes('/invite')) return true
  return route.matched.some((record) => record.meta.guestEntry)
})

onMounted(async () => {
  await nextTick()
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
