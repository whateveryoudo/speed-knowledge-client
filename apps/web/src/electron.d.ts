/// <reference types="vite/client" />

interface ElectronAPI {
  platform: string
  isElectron: boolean
  minimize: () => void
  maximize: () => void
  close: () => void
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
