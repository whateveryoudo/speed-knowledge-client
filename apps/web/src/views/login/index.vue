<template>
  <div class="login-page bg-[var(--ant-color-bg-base)]">
    <!-- Left: animated characters -->
    <div class="login-page__aside">
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
    <div class="login-page__form flex items-center justify-center p-6 sm:p-8">
      <div class="w-full max-w-[420px]">
        <!-- Mobile logo -->
        <div class="login-page__mobile-brand flex items-center justify-center gap-2 text-lg font-semibold mb-10 text-[var(--ant-color-text)]">
          <img :src="logo" alt="logo" class="w-8 h-8 object-contain" />
          <span>{{ title }}</span>
        </div>

        <div class="text-center mb-8 md:mb-10">
          <h1 class="text-3xl font-bold mb-2 text-[var(--ant-color-text)] tracking-[2px]">
            {{ loginMode === 'login' ? '欢迎回来' : '创建账号' }}
          </h1>
          <!-- <p class="text-[var(--ant-color-text-tertiary)] text-sm">
            {{ loginMode === 'login' ? '请登录您的账号' : '填写信息完成注册' }}
          </p> -->
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

          <a-form-item name="verificateCode" label="验证码">
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
              <a class="login-page__link cursor-pointer" @click="loginMode = 'login'">立即登录</a>
            </p>
            <p v-else class="text-[var(--ant-color-text-tertiary)] m-0">
              还没有账号？
              <a class="login-page__link cursor-pointer" @click="loginMode = 'register'">立即注册</a>
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
import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'
import type { ResponseType } from '@sk/types'
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

type FormData = {
  email?: string
  username: string
  password: string
  nickname?: string
  verificateCode: string
  verificateId: string
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

const rules = computed(() => {
  const baseRules: Record<string, any[]> = {
    username: loginMode.value === 'login'
      ? [{
          validator: (_rule: any, value: string) => {
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
          validator: (_rule: any, value: string) => {
            if (value && !rges.nickname.test(value)) {
              return Promise.reject('昵称：2-16位中文、数字、字母组合')
            }
            return Promise.resolve()
          },
        }]
      : [],
  }

  return {
    ...baseRules,
    verificateCode: [{ required: true, message: '请输入验证码' }],
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
    const [err] = await to(userApi.register(form.value))
    if (err) {
      loading.value = false
      initVerificateCode()
      return
    }
    message.success('注册成功!')
    loading.value = false
  } else {
    loading.value = true
    const tempParams = { ...form.value }
    delete tempParams.email
    delete tempParams.nickname
    const [err, res] = await to(authApi.login(tempParams))
    if (err) {
      loading.value = false
      const axiosErr = err as AxiosError<ResponseType>
      if (axiosErr.response?.status === 400) {
        initVerificateCode()
      }
      return
    }

    message.success('登录成功!')
    localStorage.setItem('access_token', res.data.access_token)
    await userStore.getUserInfo()
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
    loading.value = false
  }
}
</script>

<style scoped lang="less">
.login-page {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  height: 100vh;

  &__aside {
    display: none;
    min-height: 100vh;
    height: 100%;
    overflow: hidden;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.08) 20%, rgba(0, 0, 0, 0.08) 80%, transparent);
      pointer-events: none;
    }
  }

  &__form {
    min-height: 100vh;
    background: #ffffff;
  }

  &__link {
    color: var(--sd-ant-color-primary-bg);

    &:hover {
      color: #009456;
    }
  }

  &__mobile-brand {
    display: flex;
  }

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;

    &__aside {
      display: block;
    }

    &__mobile-brand {
      display: none;
    }
  }
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>
