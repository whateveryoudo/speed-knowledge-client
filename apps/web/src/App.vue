<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, type App, ref } from 'vue'
import { RouterView } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useSpaceStore } from './store/useSpaceStore'
import SpeedComponents from 'speed-components-ui-dev/debug'
import Robot from './components/robot/Trigger.vue';
import { apiVersion } from '@sk/api'
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
onMounted(async () => {
  await nextTick();
  SpeedComponents.updateTheme(app, {
    token: token.value,
  })
})
// 机器人相关接口前缀
const prefixUrl = import.meta.env.VITE_APP_PROXY_URL as string + apiVersion + '/ai/robot/chat';
const robotConfig = ref({
  token: (window.localStorage.getItem('access_token')) as string,
  // 传入接口前缀，方便后续扩展
  endPoints: {
    stream: prefixUrl + '/stream',
    history: prefixUrl + '/history',
    message: prefixUrl + '/message',
  }
})
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{
    token: {
      colorPrimary: '#00b96b',
    },
  }">
    <RouterView />
    <!-- 机器人显示 -->
    <Robot :config="robotConfig" />
  </a-config-provider>
</template>

<style scoped></style>
