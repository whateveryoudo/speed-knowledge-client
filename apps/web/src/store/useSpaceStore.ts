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
  icon: null,
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
  const { protocol, port } = window.location
  const portSuffix =
  port && port !== '80' && port !== '443' ? `:${port}` : ''

  return `${protocol}//${domain}.${root}${portSuffix}/dashboard`
}

export const useSpaceStore = defineStore('space', () => {
  const spaceInfo = ref<SpaceItem>(emptySpace())
  const isPersonalSpace = computed(() => spaceInfo.value.type === SpaceType.PERSONAL)
  /** 组织空间成员校验失败时的提示；null 表示有权或未校验 */
  const spaceAccessError = ref<{ errMessage: string } | null>(null)
  /** 已登录场景下准入校验是否结束（避免闪一下工作台） */
  const spaceAccessReady = ref(false)

  const initSpace = async () => {
    const domain = getSpaceSubdomain(window.location.hostname)
    const accessToken = localStorage.getItem('access_token')

    if (domain) {
      const [err, res] = await to(spaceApi.getSpaceInfoByDomain(domain))
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

  /**
   * Layout 用：已登录 + 组织子域时校验成员；个人空间 / 未登录不调接口。
   * 组织非成员 → 403 → 写入 spaceAccessError（页内展示，不改 URL）。
   */
  const checkSpaceAccess = async () => {
    spaceAccessError.value = null
    const accessToken = localStorage.getItem('access_token')
    const domain = getSpaceSubdomain(window.location.hostname)
    // 未登录或无组织子域：无需准入校验
    if (!accessToken || !domain) {
      spaceAccessReady.value = true
      return
    }
    spaceAccessReady.value = false
    const [err, res] = await to(spaceApi.checkSpaceAccess())
    if (!err && res?.data) {
      spaceInfo.value = res.data
      spaceAccessError.value = null
    } else {
      const errorRes = (err as any)?.response?.data as
        | { errCode?: number; errMessage?: string }
        | undefined
      if (errorRes?.errCode === 403) {
        spaceAccessError.value = {
          errMessage: errorRes.errMessage || '你不是该空间成员，可联系空间管理员添加',
        }
      }
      // 401 等由全局拦截处理；其它错误不挡 layout，避免误伤
    }
    spaceAccessReady.value = true
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
    const domain = getSpaceSubdomain(window.location.hostname)
    if (domain) {
      const root =
        (import.meta.env.VITE_SPACE_ROOT_DOMAIN as string) ||
        window.location.hostname.replace(/^[^.]+\./, '')
      const { protocol, port } = window.location
      const portSuffix =
        port && port !== '80' && port !== '443' ? `:${port}` : ''
      window.location.href = `${protocol}//${root}${portSuffix}/dashboard`
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
    spaceAccessError,
    spaceAccessReady,
    initSpace,
    checkSpaceAccess,
    isPersonalSpace,
    getSpaceInfoByUser,
    enterPersonalSpace,
    enterOrganizationSpace,
  }
})
