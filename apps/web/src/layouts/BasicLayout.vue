<template>
    <router-view />
    <!-- 机器人显示 -->
    <Robot :config="robotConfig" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Robot from '../components/robot/Trigger.vue';
import { apiVersion } from '@sk/api'
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useSystemStore } from '../store/useSystemStore';
import { notification as notificationApi } from '@sk/api';

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
const { setUnreadNotificationCount } = useSystemStore();
let socket: Socket | null = null;
const getUnreadNotificationCount = async () => {
    const res = await notificationApi.getAllUnreadCount();
    const unreadCount = Object.values(res.data).reduce((acc, curr) => acc + curr, 0);
    setUnreadNotificationCount(unreadCount);
}
// 监听通知
onMounted(() => {
    getUnreadNotificationCount(); // 初始化调用一次获取未读通知数量
    // 建立socket连接
    const rawToken = localStorage.getItem('access_token') || ''
    const token = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`

    socket = io(`${import.meta.env.VITE_NOTIFICATION_URL}/notification`, {
        path: '/socket.io',
        auth: {
            token,
        },
    })
    // socket.on('notification', (data) => {
    //     // 新消息通知
    //     setUnreadNotificationCount(data?.unreadCount ?? 0)
    // })
    socket.on("connect", () => console.log("connected", socket?.id));
    socket.on("connect_error", (e) =>
        console.log("connect_error", e.message, e),
    );
    socket.on("disconnect", (reason) => console.log("disconnect", reason));

    // Engine details for diagnosing websocket upgrade failures.
    socket.io.on("error", (err) => console.log("manager error", err));
})
onUnmounted(() => {
    socket?.disconnect()
})
</script>

<style scoped></style>