import type { App } from 'vue'

let app: App | null = null

export function setAppContext(instance: App) {
  app = instance
}

export function getAppContext(): App {
  if (!app) {
    throw new Error('[appContext] App instance is not initialized')
  }
  return app
}
