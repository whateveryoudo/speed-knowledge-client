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

export { attachmentApi }
