<template>
  <div class="flex flex-col items-center justify-center min-h-[420px] p-8 text-center bg-white rounded-[8px] border border-solid border-[var(--sd-grey-2)]">
    <div class="w-16 h-16 rounded-full bg-[var(--sd-bg-primary-hover)] flex items-center justify-center text-[28px] text-[var(--sd-primary-color)] mb-4">
      <component :is="icon || ToolOutlined" />
    </div>
    <h3 class="text-[18px] font-medium text-[var(--sd-text-primary)] mb-2">{{ title || '功能建设中' }}</h3>
    <p class="text-[14px] text-[var(--sd-text-caption)] max-w-[360px] mb-6">
      {{ description || '该功能正在全力开发中，敬请期待！可先体验通讯录与部门组织管理功能。' }}
    </p>
    <a-button type="primary" ghost @click="goContacts">前往通讯录</a-button>
  </div>
</template>

<script lang="ts" setup>
import { ToolOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

defineProps<{
  title?: string
  description?: string
  icon?: any
}>()

const router = useRouter()
const goContacts = () => {
  router.push('/space/manage/contacts')
}
</script>
