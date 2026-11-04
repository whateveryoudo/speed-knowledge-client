

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SpeedComponents from 'speed-components-ui/components'
import 'speed-components-ui/dist/style.css'
import globalComponents from '#sk-web/components/global'
import { attachment as attachmentApi, initSkApiConfig } from '@sk/api'
import { message } from 'ant-design-vue'
import 'uno.css'
import '#sk-web/assets/base.less'
import '@speed-editor/knowledge-editor/style.css'
import { setAppContext } from '#sk-web/plugins/appContext'
import { getComponentsPreviewUrl, transformFileItem } from '#sk-web/plugins/editorApis'

// 跨子域跳转或邀请加入时的 Token 安全接收：在 Vue 及所有组件库加载前的第 0 毫秒存入并抹平 URL
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search)
  const authToken = urlParams.get('auth_token')
  if (authToken) {
    localStorage.setItem('access_token', authToken)
    urlParams.delete('auth_token')
    const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : ''
    window.history.replaceState(null, '', window.location.pathname + cleanSearch + window.location.hash)
  }
}

let isRedirecting = false // 是否触发了重定向（防止页面多个接口触发多次）
initSkApiConfig({
  baseURL: import.meta.env.VITE_APP_BASE_URL || '',
  onUnauthorized: () => {
    if (isRedirecting) return
    isRedirecting = true
    localStorage.removeItem('access_token')
    if (router.currentRoute.value.path !== '/login') {
      router
        .push({
          path: '/login',
          query: {
            redirect: window.location.pathname + window.location.search,
          },
        })
        .finally(() => {
          setTimeout(() => {
            isRedirecting = false
          }, 1000)
        })
    }
  },
  onError: (msg: string) => {
    message.error(msg)
  },
})

const app = createApp(App)
setAppContext(app)
app.use(store)
app.use(router)
app.use(SpeedComponents as any, {
  iconfontUrl: [import.meta.env.VITE_ICONFONT_URL],
  access_token: localStorage.getItem('access_token'),
  apis: {
    fileUploadSingle: attachmentApi.fileUploadSingle,
    getPreviewUrl: getComponentsPreviewUrl,
  },
  useLoadConfig: {
    pageSizekey: 'page_size',
  },
  transformRequsRes: (res: any) => ({
    data: res.data?.items ?? [],
    totalCount: res.data?.total ?? 0,
    success: res.errCode === 0,
  }),
  transformFileItem,
})
app.use(globalComponents)
app.mount('#app')
