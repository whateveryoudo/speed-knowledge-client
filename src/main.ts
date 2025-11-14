import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import SpeedComponents from "speed-components-ui/components";
import 'speed-components-ui/dist/style.css';
import { useAntdCssVars } from 'speed-components-ui/hooks';
import 'uno.css'
import '@/assets/base.less'

const app = createApp(App)

app.use(router)
app.use(SpeedComponents, {
  iconfontUrl: "//at.alicdn.com/t/c/font_3786040_cw3ozxukq7o.js",
})
// 使用 Ant Design Vue CSS 变量
const { cleanup } = useAntdCssVars();

// 在应用卸载时清理
app.unmount = () => {
  cleanup?.();
  app.unmount();
};

app.mount('#app')
