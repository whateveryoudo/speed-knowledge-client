<template>
  <div class="grid grid-cols-1 min-h-screen h-screen bg-[var(--ant-color-bg-base)] md:grid-cols-2">
    <!-- Left: animated characters -->
     <!-- TODO:为什么这里要加!?优先级不够？ -->
    <div class="hidden md:!block relative min-h-screen h-full overflow-hidden">
      <div
        class="absolute top-0 right-0 bottom-0 w-px pointer-events-none bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.08)_20%,rgba(0,0,0,0.08)_80%,transparent)]"
        aria-hidden="true"
      />
      <AnimatedCharacters
        :is-typing="isTyping"
        :password="form.password"
        :show-password="showPassword"
      >
        <template #logo-icon>
          <img :src="logo" alt="logo" class="w-5 h-5 object-contain" />
        </template>
        <template #brand>{{ title }}</template>
      </AnimatedCharacters>
    </div>

    <!-- Right: login form -->
    <div class="flex min-h-screen items-center justify-center bg-white p-6 sm:p-8">
      <div class="w-full max-w-[420px]">
        <!-- Mobile logo -->
        <div class="flex md:hidden! items-center justify-center gap-2 text-lg font-semibold mb-10 text-[var(--ant-color-text)]">
          <img :src="logo" alt="logo" class="w-10 h-10 object-contain" />
          <span>{{ title }}</span>
        </div>

        <div class="text-center mb-8 md:mb-10">
          <h1 class="text-xl md:text-3xl! font-bold mb-2 text-[var(--ant-color-text)] tracking-[2px]">
            {{ loginMode === 'login' ? '欢迎回来' : '创建账号' }}
          </h1>
        </div>

        <a-form
          :model="form"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <a-form-item name="username" label="用户名">
            <a-input
              v-model:value="form.username"
              size="large"
              :placeholder="loginMode === 'login' ? '用户名/邮箱' : '用户名'"
              @focus="isTyping = true"
              @blur="isTyping = false"
            />
          </a-form-item>

          <a-form-item v-if="loginMode === 'register'" name="email" label="邮箱">
            <a-input
              v-model:value="form.email"
              size="large"
              placeholder="邮箱"
              @focus="isTyping = true"
              @blur="isTyping = false"
            />
          </a-form-item>

          <a-form-item name="password" label="密码">
            <div class="relative">
              <a-input
                v-model:value="form.password"
                size="large"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密码"
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ant-color-text-tertiary)] hover:text-[var(--ant-color-text)] transition-colors border-0 bg-transparent cursor-pointer p-0 flex items-center"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                <EyeInvisibleOutlined v-if="showPassword" class="text-lg" />
                <EyeOutlined v-else class="text-lg" />
              </button>
            </div>
          </a-form-item>

          <!-- 注册：邮箱验证码 -->
          <a-form-item v-if="loginMode === 'register'" name="email_code" label="邮箱验证码">
            <a-input-group compact class="flex!">
              <a-input
                v-model:value="form.email_code"
                size="large"
                class="flex-1!"
                placeholder="请输入邮箱验证码"
                :maxlength="6"
              />
              <!-- 这里定宽 -->
              <a-button
                size="large"
                class="basis-[114px] rounded-tl-0! rounded-bl-0!"
                :disabled="emailCodeCountdown > 0 || emailCodeSending"
                :loading="emailCodeSending"
                @click="handleSendEmailCode"
              >
                {{ emailCodeSending ? "发送中..." : (emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : '获取验证码') }}
              </a-button>
            </a-input-group>
          </a-form-item>

          <!-- 登录：失败多次后才显示图形验证码 -->
          <a-form-item
            v-if="loginMode === 'login' && captchaRequired"
            name="verificateCode"
            label="验证码"
          >
            <a-input-group compact class="flex! w-full">
              <a-input
                v-model:value="form.verificateCode"
                size="large"
                class="flex-1!"
                placeholder="验证码"
              />
              <img
                class="w-[100px] h-[40px] border border-solid cursor-pointer border-[var(--ant-color-border)] border-l-0 rounded-r-[6px] object-cover shrink-0"
                :src="verificateImg"
                alt="验证码"
                @click="initVerificateCode"
              />
            </a-input-group>
          </a-form-item>

          <a-form-item v-if="loginMode === 'register'" name="nickname" label="昵称">
            <a-input v-model:value="form.nickname" size="large" placeholder="昵称(选填)" />
          </a-form-item>

          <div class="flex items-center justify-between mb-2">
            <p v-if="loginMode === 'register'" class="text-[var(--ant-color-text-secondary)] m-0">
              已有账号？
              <a class="cursor-pointer text-[var(--sd-ant-color-primary-bg)] transition-colors hover:text-[#009456]" @click="switchMode('login')">立即登录</a>
            </p>
            <p v-else class="text-[var(--ant-color-text-tertiary)] m-0">
              还没有账号？
              <a class="cursor-pointer text-[var(--sd-ant-color-primary-bg)] transition-colors hover:text-[#009456]" @click="switchMode('register')">立即注册</a>
            </p>
          </div>

          <a-button type="primary" html-type="submit" :loading="loading" block size="large" class="mt-2">
            {{ loginMode === 'login' ? '登录' : '注册' }}
          </a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { AxiosError } from 'axios'
import type { LoginErrorDetail } from '@sk/types'
import { rges } from '@sk/utils'
import { user as userApi, auth as authApi } from '@sk/api'
import to from 'await-to-js'
import { message } from 'ant-design-vue'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '#sk-web/store/useUserStore'
import { useRouter, useRoute } from 'vue-router'
import logo from '#sk-web/assets/logo.png'
import AnimatedCharacters from './AnimatedCharacters.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const title = import.meta.env.VITE_SYS_TITLE
const loginMode = ref<'login' | 'register'>('login')
const loading = ref(false)
const showPassword = ref(false)
const isTyping = ref(false)
const captchaRequired = ref(false)
const verificateImg = ref('')
const emailCodeCountdown = ref(0)
const emailCodeSending = ref(false)

let emailCodeTimer: ReturnType<typeof setInterval> | null = null

type FormData = {
  email: string
  username: string
  password: string
  nickname: string
  email_code: string
  verificateCode: string
  verificateId: string
}

const createEmptyForm = (): FormData => ({
  email: '',
  username: '',
  password: '',
  nickname: '',
  email_code: '',
  verificateCode: '',
  verificateId: '',
})

const form = ref<FormData>(createEmptyForm())

const rules = computed(() => {
  const baseRules: Record<string, any[]> = {
    username: loginMode.value === 'login'
      ? [{
          validator: (_rule: unknown, value: string) => {
            if (!value) return Promise.reject('请输入用户名或邮箱')
            if (rges.email.test(value) || rges.username.test(value)) return Promise.resolve()
            return Promise.reject('请输入正确的用户名或邮箱格式')
          },
        }]
      : [
          { required: true, message: '请输入用户名' },
          { pattern: rges.username, message: '用户名：3-50位，支持字母、数字、下划线、中文' },
        ],
    email: loginMode.value === 'register'
      ? [
          { required: true, message: '请输入邮箱' },
          { pattern: rges.email, message: '请输入正确的邮箱格式' },
        ]
      : [],
    password: [
      { required: true, message: '请输入密码' },
      { pattern: rges.password, message: '至少10位，需包含数字、大小写字母和特殊符号' },
    ],
    nickname: loginMode.value === 'register'
      ? [{
          validator: (_rule: unknown, value: string) => {
            if (value && !rges.nickname.test(value)) {
              return Promise.reject('昵称：2-16位中文、数字、字母组合')
            }
            return Promise.resolve()
          },
        }]
      : [],
    email_code: loginMode.value === 'register'
      ? [
          { required: true, message: '请输入邮箱验证码' },
          { len: 6, message: '验证码为6位' },
        ]
      : [],
    verificateCode: loginMode.value === 'login' && captchaRequired.value
      ? [{ required: true, message: '请输入验证码' }]
      : [],
  }

  return baseRules
})

const clearEmailCodeTimer = () => {
  if (emailCodeTimer) {
    clearInterval(emailCodeTimer)
    emailCodeTimer = null
  }
}

const startEmailCodeCountdown = (seconds = 60) => {
  clearEmailCodeTimer()
  emailCodeCountdown.value = seconds
  emailCodeTimer = setInterval(() => {
    emailCodeCountdown.value -= 1
    if (emailCodeCountdown.value <= 0) {
      clearEmailCodeTimer()
    }
  }, 1000)
}

const resetCaptchaState = () => {
  captchaRequired.value = false
  verificateImg.value = ''
  form.value.verificateCode = ''
  form.value.verificateId = ''
}

const switchMode = (mode: 'login' | 'register') => {
  loginMode.value = mode
  form.value = createEmptyForm()
  resetCaptchaState()
  clearEmailCodeTimer()
  emailCodeCountdown.value = 0
}

const initVerificateCode = async () => {
  const [err, res] = await to(authApi.getVerificateCode())
  if (err) return
  verificateImg.value = res.data.captcha_image
  form.value.verificateId = res.data.captcha_id
}

const getLoginErrorDetail = (error: AxiosError): LoginErrorDetail | null => {
  const detail = (error.response?.data as { detail?: string | LoginErrorDetail })?.detail
  if (!detail) return null
  if (typeof detail === 'string') {
    return { message: detail, captcha_required: false }
  }
  return detail
}

const getErrorMessage = (error: AxiosError, fallback: string) => {
  const detail = (error.response?.data as { detail?: string | { message?: string } })?.detail
  if (typeof detail === 'string') return detail
  if (detail && typeof detail === 'object' && detail.message) return detail.message
  return fallback
}

const handleSendEmailCode = async () => {
  if (!form.value.email) {
    message.warning('请先输入邮箱')
    return
  }
  if (!rges.email.test(form.value.email)) {
    message.warning('请输入正确的邮箱格式')
    return
  }

  emailCodeSending.value = true
  const [err, res] = await to(authApi.sendEmailCode({
    email: form.value.email,
    scene: 'register',
  }))
  emailCodeSending.value = false

  if (err) {
    return
  }

  message.success(res.data.message || '验证码已发送')
  startEmailCodeCountdown(60)
}

const handleRegister = async () => {
  loading.value = true
  const [err] = await to(userApi.register({
    username: form.value.username,
    email: form.value.email,
    password: form.value.password,
    email_code: form.value.email_code,
    nickname: form.value.nickname || undefined,
  }))
  loading.value = false

  if (err) {
    return
  }

  message.success('注册成功，请登录')
  switchMode('login')
}

const handleLogin = async () => {
  loading.value = true
  const [err, res] = await to(authApi.login({
    username: form.value.username,
    password: form.value.password,
    verificateId: form.value.verificateId || undefined,
    verificateCode: form.value.verificateCode || undefined,
  }))
  loading.value = false

  if (err) {
    const axiosErr = err as AxiosError
    const loginError = getLoginErrorDetail(axiosErr)

    if (loginError?.captcha_required) {
      captchaRequired.value = true
      await initVerificateCode()
    }

    message.error(loginError?.message || getErrorMessage(axiosErr, '登录失败'))
    return
  }

  message.success('登录成功!')
  localStorage.setItem('access_token', res.data.access_token)
  await userStore.getUserInfo()
  const redirect = route.query.redirect as string
  router.push(redirect || '/dashboard')
}

const handleSubmit = async () => {
  if (loginMode.value === 'register') {
    await handleRegister()
  } else {
    await handleLogin()
  }
}

onUnmounted(() => {
  clearEmailCodeTimer()
})
</script>
