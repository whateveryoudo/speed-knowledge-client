<template>
  <a-popover
    v-model:open="open"
    placement="bottomLeft"
    trigger="click"
    :arrow="false"
    overlay-class-name="space-switcher-popover"
  >
    <template #content>
      <div class="w-[280px] py-1">
        <div class="px-3 py-2">
          <div class="text-[14px] font-medium text-[var(--sd-text-primary)] truncate">
            {{ currentTitle }}
          </div>
          <div class="text-[12px] text-[var(--sd-text-caption)] mt-0.5">
            {{ spaceStore.isPersonalSpace ? '个人空间' : '组织空间' }}
          </div>
        </div>
        <a-divider class="my-1" />

        <div class="px-2 py-1 text-[12px] text-[var(--sd-text-caption)]">空间</div>
        <div
          v-for="item in orgSpaces"
          :key="item.id"
          class="mx-1 flex items-center h-[36px] px-2 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)]"
          :class="{ 'bg-[var(--sd-bg-primary-hover)]': isActiveOrg(item) }"
          @click="switchToOrg(item)"
        >
          <span class="flex-1 truncate text-[14px]">{{ item.name }}</span>
          <CheckOutlined v-if="isActiveOrg(item)" class="text-[12px] text-[var(--ant-color-primary)]" />
        </div>
        <div
          class="mx-1 flex items-center h-[36px] px-2 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] text-[var(--ant-color-primary)]"
          @click="goCreate"
        >
          <PlusOutlined class="mr-2 text-[12px]" />
          <span>创建空间</span>
        </div>

        <a-divider class="my-1" />
        <div class="px-2 py-1 text-[12px] text-[var(--sd-text-caption)]">个人</div>
        <div
          class="mx-1 flex items-center h-[36px] px-2 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)]"
          :class="{ 'bg-[var(--sd-bg-primary-hover)]': spaceStore.isPersonalSpace }"
          @click="switchToPersonal"
        >
          <span class="flex-1 truncate text-[14px]">
            {{ userStore.userInfo.nickname || userStore.userInfo.username }}
          </span>
          <CheckOutlined
            v-if="spaceStore.isPersonalSpace"
            class="text-[12px] text-[var(--ant-color-primary)]"
          />
        </div>
      </div>
    </template>

    <div
      class="flex items-center gap-1 max-w-[160px] cursor-pointer select-none hover:opacity-80"
    >
      <span class="text-[16px] font-bold truncate">{{ currentTitle }}</span>
      <DownOutlined class="text-[10px] text-[var(--sd-text-caption)] shrink-0" />
    </div>
  </a-popover>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { to } from 'await-to-js'
import { space as spaceApi } from '@sk/api'
import type { SpaceItem } from '@sk/types'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { useUserStore } from '#sk-web/store/useUserStore'

const router = useRouter()
const spaceStore = useSpaceStore()
const userStore = useUserStore()
const open = ref(false)
const orgSpaces = ref<SpaceItem[]>([])

const currentTitle = computed(() => {
  if (spaceStore.isPersonalSpace) {
    return import.meta.env.VITE_SYS_TITLE || 'Speed Doc'
  }
  return spaceStore.spaceInfo.name || '组织空间'
})

const isActiveOrg = (item: SpaceItem) =>
  !spaceStore.isPersonalSpace && spaceStore.spaceInfo.id === item.id

const loadSpaces = async () => {
  const [err, res] = await to(spaceApi.listSpaces())
  if (err || !res?.data) return
  orgSpaces.value = res.data
}

const goCreate = () => {
  open.value = false
  router.push('/organizations/new')
}

const switchToPersonal = async () => {
  open.value = false
  await spaceStore.enterPersonalSpace()
}

const switchToOrg = async (item: SpaceItem) => {
  open.value = false
  await spaceStore.enterOrganizationSpace(item)
}

onMounted(loadSpaces)
</script>
