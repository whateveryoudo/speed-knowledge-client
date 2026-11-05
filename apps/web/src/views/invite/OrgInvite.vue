<template>
  <div class="min-h-screen bg-[var(--sd-bg-secondary)] flex items-center justify-center p-4">
    <!-- 失效或不存在展示 -->
    <a-card v-if="linkExpired" class="w-[460px] shadow-sm rounded-[12px] text-center py-6">
      <template #cover>
        <div class="pt-8 flex! justify-center">
          <div
            class="w-[64px] h-[64px] rounded-full bg-[var(--sd-grey-2)] flex items-center justify-center text-[var(--sd-text-caption)] text-[28px]">
            <ExclamationCircleOutlined />
          </div>
        </div>
      </template>
      <h2 class="text-[18px]  text-[var(--sd-text-primary)] mb-2 mt-4">邀请链接已失效</h2>
      <p class="text-[14px] text-[var(--sd-text-body)] mb-6">
        该邀请链接不存在或已被管理员重置，请联系管理员获取最新的邀请链接。
      </p>
      <a-button type="primary" class="rounded-[6px]" @click="goHome">
        返回首页
      </a-button>
    </a-card>

    <!-- 正常邀请卡片展示 -->
    <a-card v-else class="w-[460px] shadow-md rounded-[12px] border border-[var(--sd-border-primary)] overflow-hidden"
      :body-style="{ padding: '32px' }">
        <div v-if="info" class="flex flex-col">
          <!-- 组织图标 -->
          <div class="flex gap-4 items-center mb-8">
            <img :src="orgIconUrl"
              class="w-[60px] h-[60px] rounded-[8px] object-cover shadow-sm border border-[var(--sd-border-primary)]"
              alt="logo" />
            <div class="flex flex-col">
              <p class="mb-1 text-[var(--sd-text-caption)]">
                <span class="text-[var(--sd-text-primary)]">{{ info.inviter_name || '管理员' }}</span>
                邀请你加入:
              </p>
              <p class="text-[18px]  text-[var(--sd-text-primary)]">
                {{ info.org_name || '组织空间' }}
              </p>
            </div>
          </div>
          <a-divider></a-divider>
          <!-- 邀请附加信息 -->
          <div
            class="w-full rounded-[8px] py-3 mb-6 text-left text-[13px] space-y-2 border border-[var(--sd-border-primary)]">
            <a-flex v-if="info.default_dept_name" justify="space-between" align="center">
              <span class="text-[var(--sd-text-caption)]">归属部门</span>
              <span class="text-[var(--sd-text-primary)]">{{ info.default_dept_name }}</span>
            </a-flex>
          </div>

          <!-- 动态操作按钮区域 -->
          <div class="w-full mt-4">
            <!-- 状态 1：已是成员 -->
            <template v-if="info.user_status === OrgInvitationUserStatus.JOINED">
              <div
                class="mb-3 text-[13px] text-[var(--sd-ant-color-primary-bg)] flex items-center justify-center gap-1">
                <CheckCircleFilled /> 你已是该{{ orgLabel }}成员
              </div>
              <a-button type="primary" size="large" block class="rounded-[8px]" :loading="actionLoading"
                @click="enterOrg(info?.org_slug, info?.org_id)">
                进入{{ orgLabel }}
              </a-button>
            </template>

            <!-- 状态 2：审批中 -->
            <template v-else-if="info.user_status === OrgInvitationUserStatus.PENDING">
              <div class="mb-3 text-[13px] text-[var(--ant-color-warning)] flex items-center justify-center gap-1">
                <ClockCircleFilled /> 加入申请已提交，等待管理员审核
              </div>
              <a-button disabled>
                审批处理中
              </a-button>
            </template>

            <!-- 状态 3：外部临时联系人 -->
            <template v-else-if="info.user_status === OrgInvitationUserStatus.EXTERNAL">
              <div class="mb-3 text-[13px] text-[var(--sd-text-body)]">
                当前为外部联系人，点击升级为正式成员
              </div>
              <a-button type="primary"  :loading="actionLoading"
                @click="handleAccept">
                {{ info.need_approval ? '申请转为正式成员' : '立即加入' }}
              </a-button>
            </template>

            <!-- 状态 4：未加入 -->
            <template v-else>
              <a-button type="primary"  :loading="actionLoading"
                @click="handleAccept">
                {{ info.need_approval ? '申请加入' : '接受邀请并加入' }}
              </a-button>
            </template>
          </div>
        </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ExclamationCircleOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
} from '@ant-design/icons-vue'
import { orgInvitation as orgInvitationApi, space as spaceApi } from '@sk/api'
import { to } from 'await-to-js'
import {
  OrgType,
  OrgInvitationUserStatus,
  type OrgInvitationPublicInfo,
} from '@sk/types'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'
import AvatarDef from '#sk-web/assets/images/avatar_def.png'
import { buildOrganizationDashboardUrl, useSpaceStore } from '#sk-web/store/useSpaceStore'

const route = useRoute()
const router = useRouter()
const spaceStore = useSpaceStore()

const token = computed(() => (route.query.token as string) || '')

const actionLoading = ref(false)
const linkExpired = ref(false)
const info = ref<OrgInvitationPublicInfo | null>(null)

const orgLabel = computed(() => {
  return info.value?.org_type === OrgType.TEAM ? '团队' : '空间'
})

const orgIconUrl = computed(() => {
  return resolveSpaceIconUrl(info.value?.org_icon, AvatarDef)
})

const statusText = computed(() => {
  switch (info.value?.user_status) {
    case OrgInvitationUserStatus.JOINED:
      return '已加入'
    case OrgInvitationUserStatus.PENDING:
      return '审批中'
    case OrgInvitationUserStatus.EXTERNAL:
      return '外部联系人'
    default:
      return '未加入'
  }
})

const statusStyle = computed(() => {
  switch (info.value?.user_status) {
    case OrgInvitationUserStatus.JOINED:
      return 'text-[var(--sd-ant-color-primary-bg)] font-medium'
    case OrgInvitationUserStatus.PENDING:
      return 'text-[var(--ant-color-warning)] font-medium'
    case OrgInvitationUserStatus.EXTERNAL:
      return 'text-[var(--sd-link-color)] font-medium'
    default:
      return 'text-[var(--sd-text-caption)]'
  }
})

// 拉取邀请链接公开展现信息
const fetchInviteInfo = async () => {
  if (!token.value) {
    linkExpired.value = true
    return
  }
  const [err, res] = await to(orgInvitationApi.getInvitationPublicInfo(token.value))

  if (err || !res?.data) {
    linkExpired.value = true
    return
  }

  info.value = res.data
}

// 点击加入或申请
const handleAccept = async () => {
  if (!token.value) return
  actionLoading.value = true
  const [err, res] = await to(orgInvitationApi.acceptInvitation(token.value))
  actionLoading.value = false

  if (err || !res?.data) return

  const result = res.data
  if (result.user_status === OrgInvitationUserStatus.JOINED) {
    message.success(`成功加入${orgLabel.value}！正在前往...`)
    if (info.value) {
      info.value.user_status = OrgInvitationUserStatus.JOINED
    }
    // 携带响应返回的参数进入对应空间/组织
    await enterOrg(result.org_slug, result.org_id)
  } else if (result.user_status === OrgInvitationUserStatus.PENDING) {
    message.success('加入申请已提交，请等待管理员审核')
    if (info.value) {
      info.value.user_status = OrgInvitationUserStatus.PENDING
    }
  }
}

// 进入空间或团队
const enterOrg = async (targetSlug?: string | null, targetOrgId?: string | null) => {
  debugger;
  const slug = targetSlug || info.value?.org_slug
  const orgType = info.value?.org_type || OrgType.SPACE

  if (orgType === OrgType.SPACE) {
    if (slug) {
      // 1. 若支持子域环境，直接跳转到目标空间的专属二级域名 Dashboard（携带当前 Token 跨域同步）
      const url = buildOrganizationDashboardUrl(slug)
      if (url) {
        const token = localStorage.getItem('access_token')
        const targetUrl = token
          ? `${url}${url.includes('?') ? '&' : '?'}auth_token=${encodeURIComponent(token)}`
          : url
        window.location.href = targetUrl
        return
      }
      // 2. 若在本地无子域名模式下，根据返回的 slug 查询空间信息，切换当前 store 并进入
      const [err, res] = await to(spaceApi.getSpaceInfoByDomain(slug))
      if (!err && res?.data) {
        await spaceStore.enterOrganizationSpace(res.data)
        return
      }
    }
    window.location.href = '/dashboard'
  } else if (orgType === OrgType.TEAM) {
    if (slug) {
      router.push(`/dashboard/team/${slug}`)
    } else {
      router.push('/dashboard')
    }
  }
}

const goHome = () => {
  router.push('/dashboard')
}

onMounted(() => {
  fetchInviteInfo()
})
</script>
