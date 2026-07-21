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
import '@speed-tiptap-editor/knowledge-editor/style.css'
import { setAppContext } from '#sk-web/plugins/appContext'
import { getComponentsPreviewUrl, transformFileItem } from '#sk-web/plugins/editorApis'

initSkApiConfig({
  baseURL: import.meta.env.VITE_APP_BASE_URL || '',
  onUnauthorized: () => {
    localStorage.removeItem('access_token')
    if (router.currentRoute.value.path !== '/login') {
      router.push({
        path: '/login',
        query: {
          redirect: window.location.pathname + window.location.search,
        },
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
