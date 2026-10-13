"use strict";
const electron = require("electron");
const electronAPI = {
  platform: process.platform,
  isElectron: true,
  // 窗口控制
  minimize: () => electron.ipcRenderer.send("window-minimize"),
  maximize: () => electron.ipcRenderer.send("window-maximize"),
  close: () => electron.ipcRenderer.send("window-close"),
  // 监听最大化状态
  onMaximizeChange: (callback) => {
    electron.ipcRenderer.on("window-maximize-change", (_, isMaximized) => callback(isMaximized));
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electronAPI = electronAPI;
}
