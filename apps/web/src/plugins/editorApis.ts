import { attachment as attachmentApi, attachmentPrefix, apiVersion } from '@sk/api'

export const transformFileItem = (item: any) => ({
  id: item.id,
  fileType: item.file_type,
  fileSize: item.file_size,
  fileName: item.file_name,
})

export function getAttachmentPreviewUrl(fileId: string) {
  const access_token = localStorage.getItem('access_token')
  const appUrl = import.meta.env.VITE_APP_PROXY_URL
  return `${appUrl}${apiVersion}/attachment/preview/${fileId}?access_token=${access_token}`
}

export function getFilePreviewUrl(fileId: string) {
  const access_token = localStorage.getItem('access_token')
  const appUrl = import.meta.env.VITE_APP_PROXY_URL
  return `${appUrl}${apiVersion}/attachment/onlyoffice/file-preview/${fileId}?access_token=${access_token}`
}

export function getComponentsPreviewUrl(attachmentId: string) {
  return `${import.meta.env.VITE_APP_PROXY_URL}${attachmentPrefix}/preview/${attachmentId}?access_token=${localStorage.getItem('access_token')}`
}

/** 无需登录的附件预览（登录页组织 logo 等）
 * 须与 axios 一样带上 VITE_APP_BASE_URL：vite 会 strip 一层 `/api`，
 * 最终落到后端 `/api/v1/...`。若只写 `/api/v1/...` 会变成 `/v1/...` 而 404。
 */
export function getPublicAttachmentPreviewUrl(attachmentId: string) {
  const base = (import.meta.env.VITE_APP_BASE_URL as string) || ''
  return `${base}${apiVersion}/attachment/public/preview/${attachmentId}`
}

/** 空间 icon：优先 url，否则用附件 id 拼公开预览 */
export function resolveSpaceIconUrl(
  icon?: { id?: string; url?: string } | null,
  fallback = '',
) {
  if (icon?.url) return icon.url
  if (icon?.id) return getPublicAttachmentPreviewUrl(icon.id)
  return fallback
}

export { attachmentApi }
