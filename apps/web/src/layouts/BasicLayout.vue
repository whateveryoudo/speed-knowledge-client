<template>
    <!-- 已登录等准入结果，避免先闪工作台 -->
    <div v-if="isLoggedIn() && !spaceAccessReady" class="flex h-full min-h-[240px] items-center justify-center">
        <a-spin />
    </div>
    <!-- 空间或角色无权：URL 不变，通栏 Header + 居中无权卡片（对齐语雀） -->
    <div
        v-else-if="showSpaceForbidden || showRoleForbidden"
        class="flex flex-col h-screen bg-white overflow-hidden"
    >
        <GlobalHeader />
        <div class="flex-1 flex justify-center pt-[80px] pb-12 px-6 overflow-y-auto bg-white">
            <no-auth-page
                :space-name="spaceForbiddenName"
                :space-icon="spaceForbiddenIcon"
                :title="showSpaceForbidden ? '无权访问当前空间内容' : '无权访问当前页面'"
                :description="showSpaceForbidden
                    ? (spaceAccessError?.errMessage || '你不是该空间成员，可联系空间管理员添加')
                    : '仅空间管理员可访问当前页面'"
            />
        </div>
    </div>
    <template v-else>
        <router-view />
        <Robot :config="robotConfig" v-if="isLoggedIn()" />
    </template>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import Robot from '../components/robot/Trigger.vue';
import GlobalHeader from '#sk-web/components/business/header/GlobalHeader.vue';
import { apiVersion } from '@sk/api'
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { useSystemStore } from '../store/useSystemStore';
import { useSpaceStore } from '../store/useSpaceStore';
import { getAccessToken, isLoggedIn } from '@sk/utils';
import { notification as notificationApi } from '@sk/api';
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis';
import AvatarDef from '#sk-web/assets/images/avatar_def.png';

const route = useRoute();
const spaceStore = useSpaceStore();
const { spaceInfo, spaceAccessError, spaceAccessReady } = storeToRefs(spaceStore);

const showSpaceForbidden = computed(() => {
    if (!spaceAccessError.value) return false;
    if (route.path.includes('/invite')) return false;
    if (route.matched.some((r) => r.meta.guestEntry)) return false;
    return true;
});

const showRoleForbidden = computed(() => {
    if (showSpaceForbidden.value) return false;
    // 检查当前访问的路由链中是否有 meta.roles 角色要求
    const matchedWithRoles = route.matched.find((r) => r.meta && Array.isArray(r.meta.roles) && r.meta.roles.length > 0);
    if (!matchedWithRoles) return false;
    const requiredRoles = matchedWithRoles.meta.roles as string[];
    const currentRole = spaceStore.currentRole;
    if (!currentRole || !requiredRoles.includes(currentRole)) {
        return true;
    }
    return false;
});

const spaceForbiddenName = computed(() => spaceInfo.value.name || '当前空间');
const spaceForbiddenIcon = computed(() =>
    resolveSpaceIconUrl(spaceInfo.value.icon, AvatarDef),
);

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

const setupNotificationSocket = () => {
    const rawToken = getAccessToken() || ''
    if (!rawToken) {
        return
    }
    getUnreadNotificationCount();
    const token = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`

    socket = io(`${import.meta.env.VITE_NOTIFICATION_URL}/notification`, {
        path: '/socket.io',
        auth: {
            token,
        },
    })
    socket.on('notification', (data) => {
        setUnreadNotificationCount(data?.unreadCount ?? 0)
    })
    socket.on("connect", () => {
        console.log("connected", socket?.id);
        console.log(socket?.io?.engine?.transport?.name)
    })
    socket.on("connect_error", (e) =>
        console.log("connect_error", e.message, e),
    );
    socket.on("disconnect", (reason) => console.log("disconnect", reason));
    socket.io.on("error", (err) => console.log("manager error", err));
}

onMounted(async () => {
    await spaceStore.checkSpaceAccess()
    // 无权空间不拉通知 / 不连 socket
    if (spaceAccessError.value) {
        return
    }
    setupNotificationSocket()
})
onUnmounted(() => {
    socket?.disconnect()
})
</script>

<style scoped></style>
