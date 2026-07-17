import type { App } from 'vue'
import { getAppContext } from './appContext'
import {
  attachmentApi,
  getAttachmentPreviewUrl,
  getFilePreviewUrl,
  transformFileItem,
} from './editorApis'

let tiptapReady: Promise<void> | null = null
let sheetReady: Promise<void> | null = null

export function ensureTiptap(app: App = getAppContext()) {
  if (!tiptapReady) {
    tiptapReady = (async () => {
      const [mod] = await Promise.all([
        import('@speed-tiptap-editor/base-editor/plugin'),
      ])
      app.use(mod.default as any, {
        registerGlobal: false,
        access_token: localStorage.getItem('access_token'),
        apis: {
          fileDownload: attachmentApi.fileDownload,
          fileUploadSingle: attachmentApi.fileUploadSingle,
          getPreviewUrl: getAttachmentPreviewUrl,
          getFilePreviewUrl,
        },
        upload: {
          transformFileItem,
        },
        theme: 'light',
        antdToken: () => ({}),
      })
    })()
  }
  return tiptapReady
}

export function ensureSheet(app: App = getAppContext()) {
  if (!sheetReady) {
    sheetReady = (async () => {
      const [mod] = await Promise.all([
        import('@speed-sheet/vue3-antd'),
      ])
      app.use(mod.default as any, {
        apis: {
          fileDownload: attachmentApi.fileDownload,
          fileUploadSingle: attachmentApi.fileUploadSingle,
          getPreviewUrl: getAttachmentPreviewUrl,
        },
        upload: {
          transformFileItem,
          imageAccept: '.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.heic',
          fileAccept: '*',
        },
      })
    })()
  }
  return sheetReady
}
