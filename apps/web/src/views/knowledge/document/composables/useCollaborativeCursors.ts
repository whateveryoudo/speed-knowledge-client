import { ref, watch, onUnmounted, type Ref, type ShallowRef } from 'vue'
import * as Y from 'yjs'
import type { HocuspocusProvider } from '@hocuspocus/provider'
import type { Sheet } from '@speed-sheet/core'
import type { Collaborator } from '@sk/types'

/** 单个远程光标的像素位置 */
export interface RemoteCursorRect {
  clientId: number
  user: Collaborator
  /** 视口相对像素坐标 */
  x: number
  y: number
  w: number
  h: number
  color: string
}

/** 远程光标原始状态（来自 awareness） */
interface RemoteCursorState {
  clientId: number
  user: Collaborator
  cursor: {
    row: [number, number]
    column: [number, number]
  }
}

const DEFAULT_ROW_HEIGHT = 25
const DEFAULT_COL_WIDTH = 120
const DEFAULT_ROW_HEADER_WIDTH = 46
const DEFAULT_COLUMN_HEADER_HEIGHT = 25

/**
 * 从 sheet 的 Yjs state 计算单元格的视口相对像素坐标
 */
function getCellPixelRect(
  sheet: Sheet,
  r0: number,
  c0: number,
  r1: number,
  c1: number,
  viewportEl: HTMLElement,
): { x: number; y: number; w: number; h: number } | null {
  const state = sheet.state
  const rowOrder = state.rowOrder?.toArray()
  const colOrder = state.colOrder?.toArray()
  if (!rowOrder || !colOrder) return null
  if (r0 >= rowOrder.length || c0 >= colOrder.length) return null

  const rowHeightMap = state.root.get('rowHeight') as Y.Map<number> | undefined
  const colWidthMap = state.root.get('colWidth') as Y.Map<number> | undefined

  // 计算行 y 坐标和高度
  let y = 0
  for (let i = 0; i < r0; i++) {
    const id = rowOrder[i]
    y += rowHeightMap?.get(id) ?? DEFAULT_ROW_HEIGHT
  }
  let h = 0
  for (let i = r0; i <= Math.min(r1, rowOrder.length - 1); i++) {
    const id = rowOrder[i]
    h += rowHeightMap?.get(id) ?? DEFAULT_ROW_HEIGHT
  }

  // 计算列 x 坐标和宽度
  let x = 0
  for (let i = 0; i < c0; i++) {
    const id = colOrder[i]
    x += colWidthMap?.get(id) ?? DEFAULT_COL_WIDTH
  }
  let w = 0
  for (let i = c0; i <= Math.min(c1, colOrder.length - 1); i++) {
    const id = colOrder[i]
    w += colWidthMap?.get(id) ?? DEFAULT_COL_WIDTH
  }

  // 加上行头/列头偏移，减去滚动
  const scrollEl = viewportEl.querySelector('.sheet-scroll') as HTMLElement | null
  const scrollX = scrollEl?.scrollLeft ?? 0
  const scrollY = scrollEl?.scrollTop ?? 0

  return {
    x: DEFAULT_ROW_HEADER_WIDTH + x - scrollX,
    y: DEFAULT_COLUMN_HEADER_HEIGHT + y - scrollY,
    w,
    h,
  }
}

export function useCollaborativeCursors(options: {
  provider: ShallowRef<HocuspocusProvider | null>
  sheet: Ref<Sheet | null>
  viewportEl: Ref<HTMLElement | null>
  revision: Ref<number>
  currentUser: Collaborator
}) {
  const { provider, sheet, viewportEl, revision, currentUser } = options
  const remoteCursors = ref<RemoteCursorRect[]>([])

  let lastBroadcastSelection: string | null = null

  /** 广播本地选区到 awareness */
  function broadcastSelection() {
    const p = provider.value
    const s = sheet.value
    if (!p || !s) return

    const sel = s.state.getSelection()
    const key = `${sel.row[0]},${sel.row[1]},${sel.column[0]},${sel.column[1]}`
    if (key === lastBroadcastSelection) return
    lastBroadcastSelection = key

    p.setAwarenessField('cursor', {
      row: sel.row,
      column: sel.column,
    })
  }

  /** 从 awareness states 计算远程光标像素位置 */
  function updateRemoteCursors() {
    const p = provider.value
    const s = sheet.value
    const vp = viewportEl.value
    if (!p || !s || !vp) {
      remoteCursors.value = []
      return
    }

    const localClientId = p.awareness?.clientID
    const states = p.awareness?.getStates() as Map<number, any> | undefined
    if (!states) {
      remoteCursors.value = []
      return
    }

    const cursors: RemoteCursorRect[] = []
    states.forEach((state, clientId) => {
      if (clientId === localClientId) return
      if (!state.user || !state.cursor) return

      const { row, column } = state.cursor as { row: [number, number]; column: [number, number] }
      const rect = getCellPixelRect(s, row[0], column[0], row[1], column[1], vp)
      if (!rect) return

      // 裁剪到视口内
      const vpW = vp.clientWidth
      const vpH = vp.clientHeight
      if (rect.x + rect.w < 0 || rect.y + rect.h < 0) return
      if (rect.x > vpW || rect.y > vpH) return

      cursors.push({
        clientId,
        user: state.user as Collaborator,
        x: rect.x,
        y: rect.y,
        w: rect.w,
        h: rect.h,
        color: state.user.color || '#4ECDC4',
      })
    })

    remoteCursors.value = cursors
  }

  // 监听选区变化 → 广播
  const stopSelectionWatch = watch(revision, () => {
    broadcastSelection()
    // 选区变化时也更新远程光标（因为本机操作可能触发重绘）
    updateRemoteCursors()
  })

  // 监听 awareness 变化 → 更新远程光标
  function onAwarenessChange() {
    updateRemoteCursors()
  }

  // 当 provider 就绪时绑定 awareness 监听
  const stopProviderWatch = watch(provider, (newProvider, oldProvider) => {
    oldProvider?.awareness?.off('change', onAwarenessChange)
    if (newProvider?.awareness) {
      newProvider.awareness.on('change', onAwarenessChange)
      // 初次设置用户信息
      newProvider.setAwarenessField('user', {
        id: currentUser.id,
        name: currentUser.nickname || currentUser.username,
        color: currentUser.color || '#4ECDC4',
        avatar: currentUser.avatar,
      })
      broadcastSelection()
    }
  }, { immediate: true })

  // 监听滚动 → 更新远程光标位置
  let scrollEl: HTMLElement | null = null
  let scrollRaf = 0
  function onScroll() {
    cancelAnimationFrame(scrollRaf)
    scrollRaf = requestAnimationFrame(updateRemoteCursors)
  }

  const stopViewportWatch = watch(viewportEl, (newVp, oldVp) => {
    if (scrollEl) {
      scrollEl.removeEventListener('scroll', onScroll)
      scrollEl = null
    }
    if (newVp) {
      scrollEl = newVp.querySelector('.sheet-scroll') as HTMLElement | null
      scrollEl?.addEventListener('scroll', onScroll, { passive: true })
    }
  }, { immediate: true })

  onUnmounted(() => {
    stopSelectionWatch()
    stopProviderWatch()
    stopViewportWatch()
    if (scrollEl) scrollEl.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(scrollRaf)
    provider.value?.awareness?.off('change', onAwarenessChange)
    // 清除本机 awareness 中的 cursor
    provider.value?.setAwarenessField('cursor', null)
  })

  return { remoteCursors }
}