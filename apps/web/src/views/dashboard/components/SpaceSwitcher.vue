<template>
  <a-popover v-model:open="open" placement="bottomLeft" :arrow="false" trigger="click"
    overlay-class-name="space-switcher-popover">
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
          class="mx-1 flex items-center gap-2 min-h-[44px] px-2 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)]"
          :class="{ 'bg-[var(--sd-bg-primary-hover)]': isActiveOrg(item) }"
          @click="switchToOrg(item)"
        >
          <img
            :src="spaceAvatar(item)"
            alt=""
            class="w-[28px] h-[28px] rounded-[6px] object-cover shrink-0"
          />
          <span class="flex-1 truncate text-[14px]">{{ item.name }}</span>
          <CheckOutlined v-if="isActiveOrg(item)" class="text-[12px] text-[var(--ant-color-primary)]" />
        </div>
        <div
          class="menu-item-base mx-1 min-h-[40px] hover:bg-[var(--sd-bg-primary-hover)] text-[var(--ant-color-primary)]"
          @click="goCreate"
        >
          <PlusOutlined class="text-[12px]" />
          <span>创建空间</span>
        </div>

        <a-divider class="my-1" />
        <div class="px-2 py-1 text-[12px] text-[var(--sd-text-caption)]">个人</div>
        <div
          class="mx-1 flex py-2 items-center gap-2 min-h-[44px] px-3 rounded-[6px] cursor-pointer hover:bg-[var(--sd-bg-primary-hover)]"
          @click="switchToPersonal"
        >
          <img
            :src="userStore.userInfo.avatar || AvatarDef"
            alt=""
            class="w-[28px] h-[28px] rounded-full object-cover shrink-0"
          />
          <a-flex vertical class="flex-1 min-w-0" :gap="0">
            <span class="truncate text-[14px] leading-[20px]">
              {{ userStore.userInfo.nickname || userStore.userInfo.username }}
            </span>
            <span class="truncate text-[12px] text-[var(--sd-text-caption)] leading-[18px]">我自己</span>
          </a-flex>
          <CheckOutlined
            v-if="spaceStore.isPersonalSpace"
            class="text-[12px] text-[var(--ant-color-primary)]"
          />
        </div>
      </div>
    </template>

    <div class="flex items-center gap-1 max-w-[160px] cursor-pointer select-none hover:opacity-80">
      <span class="text-[16px] font-bold truncate">{{ currentTitle }}</span>
      <DownOutlined class="text-[10px] text-[var(--sd-text-caption)] shrink-0 ml-1" />
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
import AvatarDef from '#sk-web/assets/images/avatar_def.png'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'

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

const spaceAvatar = (item: SpaceItem) =>
  resolveSpaceIconUrl(item.icon, AvatarDef)

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
