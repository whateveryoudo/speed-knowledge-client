<template>
    <a-flex class="h-full" justify="center" align="center">
        <div
            class="w-[400px] border border-solid border-[var(--sd-border-primary)] bg-[var(--ant-color-bg-base)] px-[8px] py-[48px] shadow-[0_4px_8px_-4px_rgba(0,0,0,.13),0_6px_16px_0_rgba(0,0,0,.08),0_12px_24px_16px_rgba(0,0,0,.04)] rounded-[10px]">
            <div
                class="text-[25px]  mb-6 font-bold text-[var(--ant-color-text)] text-center flex items-center justify-center">
                <img :src="logo" alt="logo" class="w-[35px] h-auto mr-2"> {{ title }}
            </div>
            <a-form class="mx-auto max-w-[320px]" :model="form" :rules="rules" @finish="handleSubmit">
                <a-form-item name="username">
                    <a-input v-model:value="form.username" :placeholder="loginMode === 'login' ? '用户名/邮箱' : '用户名'" />
                </a-form-item>
                <a-form-item name="email" v-if="loginMode === 'register'">
                    <a-input v-model:value="form.email" placeholder="邮箱" />
                </a-form-item>
                <a-form-item name="password">
                    <a-input-password v-model:value="form.password" placeholder="密码" />
                </a-form-item>
                <a-form-item name="verificateCode">
                    <a-input-group compact>
                        <a-input class="w-[calc(100%-92px)]!" v-model:value="form.verificateCode" placeholder="验证码" />
                        <img class="w-[90px] h-[30px] border border-solid cursor-pointer border-[var(--ant-color-border)] border-l-0 rounded-[4px]"
                            :src="verificateImg" @click="initVerificateCode" />
                    </a-input-group>
                </a-form-item>
                <a-form-item name="nickname" v-if="loginMode === 'register'">
                    <a-input v-model:value="form.nickname" placeholder="昵称(选填)" />
                </a-form-item>
                <p v-if="loginMode === 'register'">
                    已有账号？<a class="text-[var(--sd-link-color)]" @click="loginMode = 'login'">立即登录</a>
                </p>
                <p v-if="loginMode === 'login'" class="text-[var(--ant-color-text-tertiary)] mb-4">还没有账号？<a
                        class="text-[var(--sd-link-color)]" @click="loginMode = 'register'">立即注册</a></p>
                <a-button type="primary" html-type="submit" :loading="loading" block>{{ loginMode === 'login' ? '登录' :
                    '注册' }}</a-button>

            </a-form>
        </div>
    </a-flex>

</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'
import type { ResponseType } from '@sk/types'
import { rges } from '#sk-web/utils/validate'
import { user as userApi, auth as authApi } from '@sk/api'
import to from 'await-to-js'
import { message } from 'ant-design-vue'
import { useUserStore } from '#sk-web/store/useUserStore'
import { useRouter } from 'vue-router'
import logo from '#sk-web/assets/logo.png'
const router = useRouter()
const userStore = useUserStore()
const title = import.meta.env.VITE_SYS_TITLE
const loginMode = ref<'login' | 'register'>('login')
const loading = ref(false)
type FormData = {
    email?: string;
    username: string;
    password: string;
    nickname?: string;
    verificateCode: string;
    verificateId: string;
}
const form = ref<FormData>({
    email: '',
    username: '',
    password: '',
    nickname: '',
    verificateCode: '',
    verificateId: '',
})
const verificateImg = ref('')
// 使用 computed 定义验证规则，根据登录/注册模式动态切换
const rules = computed(() => {
    const baseRules: Record<string, any[]> = {
        // 登录时：username 可以是用户名或邮箱
        // 注册时：username 必须是用户名（符合 name 规则）
        username: loginMode.value === 'login'
            ? [
                {
                    validator: (_rule: any, value: string) => {
                        if (!value) return Promise.reject('请输入用户名或邮箱')
                        // 登录时可以是邮箱或用户名
                        if (rges.email.test(value) || rges.username.test(value)) {
                            return Promise.resolve()
                        }
                        return Promise.reject('请输入正确的用户名或邮箱格式')
                    }
                }
            ]
            : [
                { required: true, message: '请输入用户名' },
                {
                    pattern: rges.username,
                    message: '用户名：3-50位，支持字母、数字、下划线、中文'
                }
            ],

        // 注册时邮箱必填
        email: loginMode.value === 'register'
            ? [
                { required: true, message: '请输入邮箱' },
                {
                    pattern: rges.email,
                    message: '请输入正确的邮箱格式'
                }
            ]
            : [],

        // 密码验证：登录和注册都需要
        password: [
            { required: true, message: '请输入密码' },
            {
                pattern: rges.password,
                message: '至少10位，需包含数字、大小写字母和特殊符号'
            }
        ],

        // 昵称：注册时可选，但如果填写需要符合规则
        nickname: loginMode.value === 'register'
            ? [
                {
                    validator: (_rule: any, value: string) => {
                        // 如果填写了昵称，需要符合规则
                        if (value && !rges.nickname.test(value)) {
                            return Promise.reject('昵称：2-16位中文、数字、字母组合')
                        }
                        return Promise.resolve()
                    }
                }
            ]
            : []
    }

    return {
        ...baseRules,
        verificateCode: [
            { required: true, message: '请输入验证码' }
        ]
    }
})
const initVerificateCode = async () => {
    const [err, res] = await to(authApi.getVerificateCode())
    if (err) {
        loading.value = false
        return
    }
    verificateImg.value = res.data.captcha_image
    form.value.verificateId = res.data.captcha_id
}
initVerificateCode()
const handleSubmit = async (values: FormData) => {
    if (loginMode.value === 'register') {
        loading.value = true
        const [err, res] = await to(userApi.register(form.value))
        if (err) {
            loading.value = false
            // 重新刷新验证码
            initVerificateCode()
            return
        }
        message.success('注册成功!')
        loading.value = false
    } else {
        loading.value = true
        const tempParams = { ...form.value };
        delete tempParams.email;
        delete tempParams.nickname;
        const [err, res] = await to(authApi.login(tempParams))
        if (err) {
            loading.value = false
            const axiosErr = err as AxiosError<ResponseType>
            if (axiosErr.response?.status === 400) {
                initVerificateCode()
            }
            return
        }


        message.success('登录成功!');
        // 将token存入localstorage
        localStorage.setItem('access_token', res.data.access_token)
        await userStore.getUserInfo()
        router.push('/dashboard')
        loading.value = false
    }
}
</script>
<style scoped lang="less"></style>