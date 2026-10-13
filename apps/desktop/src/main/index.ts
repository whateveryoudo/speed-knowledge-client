import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 拦截外链：默认使用系统系统浏览器打开，避免在当前 App 内迷失
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 窗口最大化事件通知渲染层
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize-change', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize-change', false)
  })

  // IPC 控制
  ipcMain.on('window-minimize', () => mainWindow.minimize())
  ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.on('window-close', () => mainWindow.close())

  // 开发环境加载 Vite dev server，生产环境加载 web 构建产物
  const devServerUrl = process.env['ELECTRON_RENDERER_URL'] || 'http://localhost:5173'
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(devServerUrl)
  } else if (is.dev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../../../web/dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
