<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, type App, ref } from 'vue'
import { RouterView } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useSpaceStore } from './store/useSpaceStore'
import SpeedComponents from 'speed-components-ui-dev/debug'

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

</script>

<template>
  <a-config-provider :locale="zhCN" :theme="{
    token: {
      colorPrimary: '#00b96b',
    },
  }">
    <RouterView />
  </a-config-provider>
</template>

<style scoped></style>
