<script setup lang="ts">
import { RouterView } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useSpaceStore } from './store/useSpaceStore'
dayjs.locale('zh-cn')
// 初始化空间信息

const { initSpace } = useSpaceStore()
initSpace()
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
