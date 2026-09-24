<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--ant-color-bg-base)] px-4 py-10">
    <div class="w-full max-w-[420px]">
      <div class="flex flex-col items-center mb-8">
        <img :src="logo" alt="logo" class="w-10 h-10 object-contain mb-4" />
        <h1 class="text-[22px] font-semibold text-[var(--sd-text-primary)] m-0">
          设置空间信息
        </h1>
      </div>

      <a-form
        layout="vertical"
        :model="form"
        :rules="rules"
        @finish="handleSubmit"
      >
        <a-form-item label="空间名称" name="name">
          <a-input
            v-model:value="form.name"
            size="large"
            placeholder="可输入企业或团队名称"
            :maxlength="50"
          />
        </a-form-item>

        <a-form-item label="空间域名" name="domain">
          <a-input
            v-model:value="form.domain"
            size="large"
            placeholder="4-20 个数字或字母"
            :maxlength="20"
            @blur="handleDomainBlur"
          >
            <template #addonAfter>.{{ rootDomain }}</template>
          </a-input>
          <div class="mt-1 text-[12px] text-[var(--sd-text-caption)]">
            成员访问空间的地址，设置后不可修改
          </div>
        </a-form-item>

        <a-form-item label="联系邮箱" name="contact_email">
          <a-input
            v-model:value="form.contact_email"
            size="large"
            placeholder="用于接收费用和使用等关键信息"
          />
        </a-form-item>

        <a-button
          type="primary"
          html-type="submit"
          size="large"
          block
          :loading="submitting"
          :disabled="!agreed"
        >
          下一步
        </a-button>

        <div class="mt-4 flex items-start gap-2 text-[13px] text-[var(--sd-text-caption)]">
          <a-checkbox v-model:checked="agreed" />
          <span>我已阅读并同意创建组织空间</span>
        </div>
      </a-form>

      <div class="mt-8 text-center">
        <a class="text-[13px] text-[var(--sd-text-caption)]" @click="goBack">
          返回个人空间
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { to } from 'await-to-js'
import { space as spaceApi } from '@sk/api'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { useUserStore } from '#sk-web/store/useUserStore'
import logo from '#sk-web/assets/logo.png'

const router = useRouter()
const spaceStore = useSpaceStore()
const userStore = useUserStore()

const rootDomain =
  (import.meta.env.VITE_SPACE_ROOT_DOMAIN as string) ||
  window.location.hostname.replace(/^[^.]+\./, '') ||
  'localhost'

const agreed = ref(true)
const submitting = ref(false)
const form = reactive({
  name: '',
  domain: '',
  contact_email: userStore.userInfo.email || '',
})

const domainPattern = /^[a-z0-9]{4,20}$/

const rules: Record<string, Rule[]> = {
  name: [
    { required: true, message: '请输入空间名称' },
    { min: 2, max: 50, message: '名称长度为 2-50 个字符' },
  ],
  domain: [
    { required: true, message: '请输入空间域名' },
    {
      pattern: domainPattern,
      message: '域名需为 4-20 位小写字母或数字',
    },
  ],
  contact_email: [
    { required: true, message: '请输入联系邮箱' },
    { type: 'email', message: '邮箱格式不正确' },
  ],
}

const handleDomainBlur = async () => {
  const domain = form.domain.trim().toLowerCase()
  form.domain = domain
  if (!domainPattern.test(domain)) return
  const [err] = await to(spaceApi.checkDomainAvailable(domain))
  if (err) {
    message.warning('域名不可用，请更换')
  }
}

const handleSubmit = async () => {
  if (!agreed.value) {
    message.warning('请先同意创建组织空间')
    return
  }
  submitting.value = true
  const payload = {
    name: form.name.trim(),
    domain: form.domain.trim().toLowerCase(),
    contact_email: form.contact_email.trim(),
  }
  const [err, res] = await to(spaceApi.createSpace(payload))
  submitting.value = false
  if (err || !res?.data) return

  message.success('空间创建成功')
  await spaceStore.enterOrganizationSpace(res.data)
}

const goBack = () => {
  router.push('/dashboard')
}
</script>
