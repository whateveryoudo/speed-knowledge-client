import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type SpaceItem, SpaceType } from '@sk/types'
import { to } from 'await-to-js'
import { space as spaceApi } from '@sk/api'
import { message } from 'ant-design-vue'
import { getSpaceSubdomain } from '@sk/utils'

const emptySpace = (): SpaceItem => ({
  id: '',
  type: SpaceType.PERSONAL,
  name: '',
  domain: '',
  owner_id: '',
  contact_email: '',
  icon: {
    id: '',
    url: '',
  },
  description: '',
  created_at: '',
  updated_at: '',
  space_members: [],
})

/** 组织空间 dashboard 地址；本地无根域时退回同 host */
export const buildOrganizationDashboardUrl = (domain: string) => {
  const root =
    (import.meta.env.VITE_SPACE_ROOT_DOMAIN as string) ||
    (typeof window !== 'undefined'
      ? window.location.hostname.replace(/^[^.]+\./, '')
      : '')
  if (!root || root === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(root)) {
    return null
  }
  const { protocol } = window.location
  return `${protocol}//${domain}.${root}/dashboard`
}

export const useSpaceStore = defineStore('space', () => {
  const spaceInfo = ref<SpaceItem>(emptySpace())
  const isPersonalSpace = computed(() => spaceInfo.value.type === SpaceType.PERSONAL)

  const initSpace = async () => {
    const domin = getSpaceSubdomain(window.location.hostname)
    const accessToken = localStorage.getItem('access_token')

    if (domin) {
      const [err, res] = await to(spaceApi.getSpaceInfoByDomin(domin))
      if (err) {
        message.error(err.message)
        return
      }
      spaceInfo.value = res.data
    } else if (accessToken) {
      const [err, res] = await to(spaceApi.getSpaceInfo())
      if (err) {
        message.error(err.message)
        return
      }
      if (res.data) {
        spaceInfo.value = res.data
      }
    }
  }

  const getSpaceInfoByUser = async () => {
    const [err, res] = await to(spaceApi.getSpaceInfo())
    if (err) {
      message.error(err.message)
      return
    }
    if (res.data) {
      spaceInfo.value = res.data
    }
  }

  const enterPersonalSpace = async () => {
    const domin = getSpaceSubdomain(window.location.hostname)
    if (domin) {
      const root =
        (import.meta.env.VITE_SPACE_ROOT_DOMAIN as string) ||
        window.location.hostname.replace(/^[^.]+\./, '')
      window.location.href = `${window.location.protocol}//${root}/dashboard`
      return
    }
    await getSpaceInfoByUser()
    window.location.href = '/dashboard'
  }

  const enterOrganizationSpace = async (space: SpaceItem) => {
    if (!space.domain) {
      message.error('空间域名缺失')
      return
    }
    const url = buildOrganizationDashboardUrl(space.domain)
    if (url) {
      window.location.href = url
      return
    }
    // 本地开发：无子域名时直接写入当前 store
    spaceInfo.value = space
    window.location.href = '/dashboard'
  }

  return {
    spaceInfo,
    initSpace,
    isPersonalSpace,
    getSpaceInfoByUser,
    enterPersonalSpace,
    enterOrganizationSpace,
  }
})
