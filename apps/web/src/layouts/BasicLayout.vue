<template>
    <router-view />
    <!-- 机器人显示 -->
    <Robot :config="robotConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Robot from '../components/robot/Trigger.vue';
import { apiVersion } from '@sk/api'
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

<style scoped></style>