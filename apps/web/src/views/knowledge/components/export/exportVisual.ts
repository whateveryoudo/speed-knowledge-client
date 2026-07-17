import { createApp, nextTick, reactive, type App, h } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { document as documentApi } from '@sk/api'
import { downloadFileFromStream } from '@sk/utils'
import {
  attachmentApi,
  getAttachmentPreviewUrl,
  getFilePreviewUrl,
  transformFileItem,
} from '#sk-web/plugins/editorApis'
import DocumentExportPreview from '../../document/template/DocumentExportPreview.vue'
import type { ClientVisualFormat } from './items'

const EXPORT_CONTENT_WIDTH = 794

export type ExportVisualResult = {
  blob: Blob
  fileName: string
}

type MountedPreview = {
  app: App
  host: HTMLElement
  rootEl: HTMLElement
}

function unwrapContentJson(raw: unknown): Record<string, unknown> | string | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return (parsed?.default ?? parsed) as Record<string, unknown>
    } catch {
      return raw
    }
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    return (obj.default as Record<string, unknown>) ?? obj
  }
  return null
}

async function resolveContentJson(
  documentId: string,
  contentJson?: string | null | Record<string, unknown>,
) {
  if (contentJson != null && contentJson !== '') {
    return unwrapContentJson(contentJson)
  }
  const res = await documentApi.getDocumentContent(documentId)
  return unwrapContentJson(res?.data)
}

async function waitForSelector(root: ParentNode, selector: string, timeoutMs = 8000) {
  const found = root.querySelector(selector)
  if (found) return found
  return new Promise<Element>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      observer.disconnect()
      reject(new Error(`等待选择器超时: ${selector}`))
    }, timeoutMs)
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector)
      if (el) {
        window.clearTimeout(timer)
        observer.disconnect()
        resolve(el)
      }
    })
    observer.observe(root, { childList: true, subtree: true })
  })
}

async function waitForImages(root: HTMLElement, timeoutMs = 8000) {
  const images = Array.from(root.querySelectorAll('img'))
  if (!images.length) {
    await new Promise((r) => setTimeout(r, 120))
    return
  }
  await Promise.race([
    Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve()
              return
            }
            const done = () => resolve()
            img.addEventListener('load', done, { once: true })
            img.addEventListener('error', done, { once: true })
          }),
      ),
    ),
    new Promise((r) => setTimeout(r, timeoutMs)),
  ])
}

/** 离屏 app 需单独 use TipTap 插件（与 ensureTiptap 配置对齐） */
async function installTiptapOnApp(app: App) {
  const mod = await import('@speed-tiptap-editor/base-editor/plugin')
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
}

async function mountExportPreview(options: {
  json: string | null | Record<string, unknown>
  title: string
}): Promise<MountedPreview> {
  const host = document.createElement('div')
  host.setAttribute('data-document-export-host', '1')
  host.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${EXPORT_CONTENT_WIDTH}px`,
    'z-index:-1',
    'background:#fff',
  ].join(';')
  document.body.appendChild(host)

  // 先空 json 挂载，等 editor 就绪后再写入，避免 SpeedEditor watch(immediate) 时 editor 仍为 null
  const state = reactive({
    json: null as string | null | Record<string, unknown>,
    title: options.title,
    contentWidth: EXPORT_CONTENT_WIDTH,
  })

  const app = createApp({
    setup() {
      return () => h(DocumentExportPreview, {
        json: state.json,
        title: state.title,
        contentWidth: state.contentWidth,
      })
    },
  })
  await installTiptapOnApp(app)

  app.mount(host) as InstanceType<typeof DocumentExportPreview> & {
    rootRef?: HTMLElement | null
  }
  await nextTick()
  await waitForSelector(host, '.ProseMirror')
  state.json = options.json
  await nextTick()
  await new Promise((r) => requestAnimationFrame(() => r(undefined)))
  await waitForImages(host)
  const rootEl =
  (host.querySelector('.document-export-preview') as HTMLElement) || host
  return { app, host, rootEl }
}

function unmountExportPreview(mounted: MountedPreview) {
  try {
    mounted.app.unmount()
  } catch {
    // ignore
  }
  mounted.host.remove()
}

function cropCanvasBottom(canvas: HTMLCanvasElement, cropPixels = 2) {
  const croppedHeight = Math.max(canvas.height - cropPixels, 0)
  const cropped = document.createElement('canvas')
  cropped.width = canvas.width
  cropped.height = croppedHeight
  const ctx = cropped.getContext('2d')
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, canvas.width, croppedHeight, 0, 0, canvas.width, croppedHeight)
  }
  return cropped
}

async function elementToCanvas(el: HTMLElement) {
  const canvas = await html2canvas(el, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF',
    scale: 2,
    logging: false,
  })
  if (!canvas.width || !canvas.height) {
    throw new Error('生成画布失败：内容宽高为 0')
  }
  return cropCanvasBottom(canvas)
}

function canvasToJpgBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('图片转换失败'))
        else resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}

function canvasToPdfBlob(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const margin = 10
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  const pxPerMm = canvas.width / usableWidth
  const pageHeightPx = Math.floor(usableHeight * pxPerMm)

  let renderedHeightPx = 0
  let pageIndex = 0

  while (renderedHeightPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx)
    if (sliceHeightPx <= 0) break

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = sliceHeightPx
    const ctx = pageCanvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    ctx.drawImage(
      canvas,
      0,
      renderedHeightPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx,
    )

    const pageImgData = pageCanvas.toDataURL('image/png')
    const sliceHeightMm = sliceHeightPx / pxPerMm
    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(pageImgData, 'PNG', margin, margin, usableWidth, sliceHeightMm)

    renderedHeightPx += sliceHeightPx
    pageIndex += 1
  }

  return pdf.output('blob')
}

/**
 * 前端导出 PDF / 长图：离屏挂载只读 KnowledgeEditor → html2canvas → 下载
 */
export async function exportDocumentVisual(options: {
  documentId: string
  title?: string
  format: ClientVisualFormat
  contentJson?: string | null | Record<string, unknown>
  onProgress?: (percent: number) => void
}): Promise<ExportVisualResult> {
  const { documentId, format, onProgress } = options
  const title = (options.title || 'document').trim() || 'document'
  onProgress?.(10)

  const json = await resolveContentJson(documentId, options.contentJson)
  if (!json) {
    throw new Error('无法获取文档内容')
  }
  onProgress?.(30)
  const mounted = await mountExportPreview({ json, title })
  onProgress?.(55)
  try {
    const canvas = await elementToCanvas(mounted.rootEl)
    onProgress?.(80)

    if (format === 'image') {
      const blob = await canvasToJpgBlob(canvas)
      onProgress?.(100)
      return { blob, fileName: `${title}.png` }
    }

    const blob = canvasToPdfBlob(canvas)
    onProgress?.(100)
    return { blob, fileName: `${title}.pdf` }
  } finally {
    unmountExportPreview(mounted)
  }
}

export function downloadVisualExport(result: ExportVisualResult) {
  downloadFileFromStream(result.blob, result.fileName)
}
