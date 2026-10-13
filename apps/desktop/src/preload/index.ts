import { contextBridge, ipcRenderer } from 'electron'

// 暴露给 Vue (window.electronAPI) 的安全 API
const electronAPI = {
  platform: process.platform,
  isElectron: true,
  // 窗口控制
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  // 监听最大化状态
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window-maximize-change', (_, isMaximized) => callback(isMaximized))
  },
}

export type ElectronAPI = typeof electronAPI

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI
}
