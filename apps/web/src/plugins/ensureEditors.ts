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
let boardReady: Promise<void> | null = null

export function ensureTiptap(app: App = getAppContext()) {
  if (!tiptapReady) {
    tiptapReady = (async () => {
      const [mod] = await Promise.all([
        import('@speed-editor/knowledge-editor/plugin'),
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

export function ensureBoard(app: App = getAppContext()) {
  if (!boardReady) {
    boardReady = (async () => {
      const [mod] = await Promise.all([
        import('@speed-board/vue3-antd'),
      ])
      app.use(mod.default as any, {
        registerGlobal: true
      })
    })()
  }
  return boardReady
}

/**
 * 闲时全量预加载调度器：
 */
export async function ensureAllEditors(app: App = getAppContext()) {
  await Promise.all([ensureTiptap(app),ensureSheet(app), ensureBoard(app)])
}

let idleScheduled = false

/**
 * 闲时全量预热调度入口：
 * 保证冷启动/当前关键页面渲染绝对优先（零资源争抢）；
 * 等待当前页面渲染就绪且浏览器进入空闲期（requestIdleCallback）时，在后台静默补齐其余全部编辑器。
 */
export function preloadAllEditorsOnIdle(delay = 1800, app: App = getAppContext()) {
  if (idleScheduled) return
  idleScheduled = true

  const runIdle = (cb: () => void, timeout = 3000) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout })
    } else {
      setTimeout(cb, 1000)
    }
  }

  setTimeout(() => {
    runIdle(() => {
      ensureAllEditors(app)
    })
  }, delay)
}
