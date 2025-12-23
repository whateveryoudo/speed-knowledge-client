<template>
    <a-popover placement="bottomLeft" :title="false" :arrow="false">
        <template #content>
            <div class="w-[200px]">
                <a-flex gap="middle" align="center">
                    <img :src="AvatarDef" alt="avatar" class="w-[36px] h-[36px]" />
                    <a-flex>
                        <p class="text-[var(--sd-text-primary)]">{{ userInfo.nickname || userInfo.username }}</p>
                    </a-flex>
                </a-flex>
                <a-divider class="my-2"></a-divider>
                <div v-for="item in menuItems" :key="item.key" @click="menuClick(item.key)"
                    class="flex items-center h-[32px] my-[4px] px-[10px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200 cursor-pointer">
                    <s-icon-font class="mr-3" :icon-render="item.icon" />
                    <span>{{ item.label }}</span>
                </div>
                <a-divider class="my-2"></a-divider>
                <div @click="loginOut"
                    class="flex items-center h-[32px] my-[4px] px-[10px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200 cursor-pointer">
                    <LoginOutlined class="mr-3" />
                    <span>退出登录</span>
                </div>
            </div>
        </template>
        <a-button type="text" class="shadow-btn-wrapper">
            <img :src="AvatarDef" alt="avatar" class="w-[24px] h-[24px]" />
        </a-button>
    </a-popover>
</template>
<script lang="ts" setup>
import AvatarDef from '#sk-web/assets/images/avatar_def.png';
import { useUserStore } from '#sk-web/store/useUserStore';
import { h } from 'vue'
import { SettingOutlined, LoginOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const { userInfo } = storeToRefs(useUserStore())
const menuItems = [
    {
        key: 'setting',
        icon: () => h(SettingOutlined),
        label: '设置',
    }
]
const menuClick = (key: string) => {
    switch (key) {
        case 'setting':
            router.push('/user/setting')
            break
    }
}
const loginOut = () => {
    // 这里是jwt无状态，不需要请求后端
    localStorage.removeItem('access_token')
    router.push('/login?redirect=' + encodeURIComponent(route.path))
}
</script>