import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type SpaceItem, SpaceType, SpaceMemberRole } from '@sk/types'
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

/** 获取平台主域名（根域）的完整 Origin (例如本地 http://speed.localhost:5173 或线上 https://example.com) */
export const getMainOrigin = (): string => {
  if (typeof window === 'undefined') return ''
  const domain = getSpaceSubdomain(window.location.hostname)
  const root =
    (import.meta.env.VITE_SPACE_ROOT_DOMAIN as string) ||
    (domain ? window.location.hostname.replace(/^[^.]+\./, '') : window.location.hostname)

  const { protocol, port } = window.location
  const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ''
  return `${protocol}//${root}${portSuffix}`
}

export const useSpaceStore = defineStore('space', () => {
  const spaceInfo = ref<SpaceItem>(emptySpace())
  const isPersonalSpace = computed(() => spaceInfo.value.type === SpaceType.PERSONAL)
  /** 组织空间成员校验失败时的提示；null 表示有权或未校验 */
  const spaceAccessError = ref<{ errMessage: string } | null>(null)
  /** 已登录场景下准入校验是否结束（避免闪一下工作台） */
  const spaceAccessReady = ref(false)

  /** 当前登录用户在该空间的角色（个人空间天然为 owner） */
  const currentRole = computed<SpaceMemberRole | null>(() => {
    if (isPersonalSpace.value) return SpaceMemberRole.OWNER
    return spaceInfo.value.current_role ?? null
  })

  /** 是否为空间管理员（Owner 或 Admin） */
  const isSpaceAdmin = computed<boolean>(() => {
    if (isPersonalSpace.value) return true
    return (
      currentRole.value === SpaceMemberRole.OWNER ||
      currentRole.value === SpaceMemberRole.ADMIN
    )
  })

  /** 是否为空间所有者 */
  const isSpaceOwner = computed<boolean>(() => {
    if (isPersonalSpace.value) return true
    return currentRole.value === SpaceMemberRole.OWNER
  })

  /**
   * 1. 登录页/公开展示页用：根据二级域名拉取公开信息（名称、Logo）
   */
  const loadPublicSpaceByDomain = async () => {
    const domain = getSpaceSubdomain(window.location.hostname)
    if (!domain) return
    const [err, res] = await to(spaceApi.getSpaceInfoByDomain(domain))
    if (!err && res?.data) {
      spaceInfo.value = res.data
    }
  }

  /**
   * 2. 工作台 BasicLayout 用：校验已登录用户的空间准入与角色权限
   */
  const checkSpaceAccess = async () => {
    spaceAccessError.value = null
    const domain = getSpaceSubdomain(window.location.hostname)

    // 场景 A：组织二级域名 -> 调 /current/access 校验成员准入并获取角色
    if (domain) {
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
      }
      spaceAccessReady.value = true
      return
    }

    // 场景 B：主站根域名 -> 获取当前登录用户的个人空间
    spaceAccessReady.value = true
    const [err, res] = await to(spaceApi.getSpaceInfo())
    if (!err && res?.data) {
      spaceInfo.value = res.data
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
    const domain = getSpaceSubdomain(window.location.hostname)
    if (domain) {
      const token = localStorage.getItem('access_token')
      const targetUrl = `${getMainOrigin()}/dashboard`
      window.location.href = token
        ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}auth_token=${encodeURIComponent(token)}`
        : targetUrl
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
      const token = localStorage.getItem('access_token')
      const targetUrl = token
        ? `${url}${url.includes('?') ? '&' : '?'}auth_token=${encodeURIComponent(token)}`
        : url
      window.location.href = targetUrl
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
    currentRole,
    isSpaceAdmin,
    isSpaceOwner,
    loadPublicSpaceByDomain,
    checkSpaceAccess,
    isPersonalSpace,
    getSpaceInfoByUser,
    enterPersonalSpace,
    enterOrganizationSpace,
  }
})
