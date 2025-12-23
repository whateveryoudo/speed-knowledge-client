import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import SpeedTiptapEditor from 'speed-tiptap-editor-dev/debug'
// import SpeedComponents from "speed-components-ui/components";
// 先通过文件夹的方式，我需要调试speed-components-ui的组件,没问题了在切回到包的使用方式
import SpeedComponents from 'speed-components-ui-dev/debug'
import 'speed-components-ui/dist/style.css'
import { useAntdCssVars } from 'speed-components-ui/hooks'
import globalComponents from '#sk-web/components/global'
import { attachment as attachmentApi, initSkApiConfig, attachmentPrefix } from '@sk/api'
import { message } from 'ant-design-vue'
import 'uno.css'
import '#sk-web/assets/base.less'
// 初始化注入api一些方法,属性
initSkApiConfig({
  baseURL: import.meta.env.VITE_APP_BASE_URL || '',
  onUnauthorized: () => {
    // TODO:更多的清空处理
    localStorage.removeItem('access_token')
    router.push({
      path: '/login',
      query: {
        // 添加重定向参数
        redirect: window.location.pathname + window.location.search,
      },
    })
  },
  onError: (msg: string) => {
    message.error(msg)
  },
})
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(SpeedTiptapEditor)
app.use(SpeedComponents, {
  apis: {
    fileUploadSingle: attachmentApi.fileUploadSingle,
    getPreviewUrl: (attachmentId: string) => {
      return `${import.meta.env.VITE_APP_PROXY_URL}${attachmentPrefix}/preview/${attachmentId}?access_token=${localStorage.getItem('access_token')}`
    },
  },
  // 附件单条数据转换
  transformFileItem: (item: any) => {
    return {
      id: item.id,
      fileType: item.file_type,
      fileSize: item.file_size,
      fileName: item.file_name,
    }
  },
})
// 使用 Ant Design Vue CSS 变量
const { cleanup } = useAntdCssVars()

// 在应用卸载时清理
app.unmount = () => {
  cleanup?.()
  app.unmount()
}

app.use(globalComponents)
app.mount('#app')
