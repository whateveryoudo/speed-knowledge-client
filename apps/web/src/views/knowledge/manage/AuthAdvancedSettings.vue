<template>
  <s-full-modal width="520px" :open="open" title="高级设置" :footer="false" :destroy-on-close="true"
    @cancel="emit('update:open', false)">
    <a-spin :spinning="loading">
      <section class="mb-8">
        <div class="mb-2 text-[14px] text-[var(--sd-text-primary)]">密码设置</div>
        <p class="mb-4 text-[13px] text-[var(--sd-text-caption)] leading-[22px]">
          开启后，本知识库下的所有公开内容，都需要密码访问。
        </p>
        <a-flex :gap="8" align="center">
          <a-input class="flex-1" :value="passwordEnabled ? accessSetting?.password ?? '' : ''"
            :placeholder="passwordEnabled ? '' : '点击开启生成随机密码'" readonly>
            <template v-if="passwordEnabled" #suffix>
              <a-button type="link" size="small" @click="handleCopyPassword">
                <template #icon>
                  <CopyOutlined />
                </template>
              </a-button>
            </template>
          </a-input>
          <a-button v-if="!passwordEnabled" type="primary" :loading="passwordSubmitting" :disabled="!canManage"
            @click="handleEnablePassword">
            开启
          </a-button>
          <template v-else>
            <a-button :loading="passwordSubmitting" :disabled="!canManage" @click="handleRegeneratePassword">
              重新生成
            </a-button>
            <a-button danger :loading="passwordSubmitting" :disabled="!canManage" @click="handleDisablePassword">
              关闭
            </a-button>
          </template>
        </a-flex>
      </section>

      <section>
        <div class="mb-2 text-[14px] text-[var(--sd-text-primary)]">搜索设置</div>
        <p class="mb-4 text-[13px] text-[var(--sd-text-caption)] leading-[22px]">
          开启后，互联网所有人可搜到知识库里的公开内容。
          <span class="text-[var(--ant-color-warning)]">若开启了密码，则搜索设置无效。</span>
        </p>
        <a-flex justify="space-between" align="center" class="mb-2">
          <span>允许站内公开搜索</span>
          <a-switch :checked="allowPublicSearch" :disabled="passwordEnabled || !canManage"
            @change="handleSearchToggle" />
        </a-flex>
        <p v-if="passwordEnabled" class="text-[12px] text-[var(--sd-text-caption)]">
          已开启密码保护，公开搜索暂不可用。
        </p>
        <p v-else class="text-[12px] text-[var(--sd-text-caption)]">
          搜索能力后续接入，当前开关为默认开启的占位配置。
        </p>
      </section>
    </a-spin>
  </s-full-modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { useClipboard } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { to } from 'await-to-js'
import { resource as resourceApi } from '@sk/api'
import {
  CollaboratorResourceType,
  type ResourceAccessItem,
} from '@sk/types'

const props = defineProps<{
  open: boolean
  knowledgeId: string
  canManage: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'password-change', enabled: boolean): void
}>()

const loading = ref(false)
const passwordSubmitting = ref(false)
const accessSetting = ref<ResourceAccessItem | null>(null)
const password = computed(() => accessSetting.value?.password ?? '')
const allowPublicSearch = ref(true)
const { copy } = useClipboard({
  source: password
})

const passwordEnabled = computed(() => Boolean(accessSetting.value?.password))

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const handleCopyPassword = () => {
  copy().then(() => {
    message.success('密码已复制')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

const loadAccessSetting = async () => {
  if (!props.knowledgeId) return
  loading.value = true
  const [err, res] = await to(
    resourceApi.getResourceAccessByTarget(CollaboratorResourceType.KNOWLEDGE, props.knowledgeId),
  )
  loading.value = false
  if (err) {
    accessSetting.value = null
    emit('password-change', false)
    return
  }
  accessSetting.value = res?.data ?? null
  emit('password-change', Boolean(accessSetting.value?.password))
}

const handleEnablePassword = async () => {
  if (!props.canManage) return
  passwordSubmitting.value = true
  const password = generatePassword()
  const [err, res] = await to(
    resourceApi.createResourceAccess({
      target_id: props.knowledgeId,
      target_type: CollaboratorResourceType.KNOWLEDGE,
      password,
    }),
  )
  passwordSubmitting.value = false
  if (err) return
  accessSetting.value = res!.data
  allowPublicSearch.value = false
  emit('password-change', true)
  message.success('密码保护已开启')
}

const handleRegeneratePassword = async () => {
  if (!props.canManage || !accessSetting.value?.id) return
  passwordSubmitting.value = true
  const password = generatePassword()
  const [err, res] = await to(
    resourceApi.updateResourceAccess(accessSetting.value.id, { password }),
  )
  passwordSubmitting.value = false
  if (err) return
  accessSetting.value = res!.data
  message.success('密码已重新生成')
}

const handleDisablePassword = async () => {
  if (!props.canManage || !accessSetting.value?.id) return
  passwordSubmitting.value = true
  const [err] = await to(resourceApi.deleteResourceAccess(accessSetting.value.id))
  passwordSubmitting.value = false
  if (err) return
  accessSetting.value = null
  allowPublicSearch.value = true
  emit('password-change', false)
  message.success('密码保护已关闭')
}

const handleSearchToggle = (checked: boolean | string | number) => {
  if (passwordEnabled.value) return
  allowPublicSearch.value = Boolean(checked)
  message.info('搜索设置将在后续版本接入')
}

watch(
  () => props.open,
  (visible) => {
    if (visible) {
      allowPublicSearch.value = true
      loadAccessSetting()
    }
  },
)

watch(passwordEnabled, (enabled) => {
  if (enabled) {
    allowPublicSearch.value = false
  }
})
</script>
