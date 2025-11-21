import { fileURLToPath, URL } from 'node:url'

import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from '@unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { createSimpleSvgSpritePlugin } from './vitePlugins/simple-svg-sprinte'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

// https://vite.dev/config/
export default (env: any) => {
  const apiProxyUrl = env.VITE_APP_PROXY_URL ?? 'http://localhost:8005'
  const apiBaseUrl = env.VITE_API_BASE_URL ?? '/api'
  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      Unocss(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // 不使用自动导入样式
            resolveIcons: true, // 自动解析图标
          }),
        ],
        dts: 'src/components.d.ts', // 生成类型声明文件
      }),
      createSimpleSvgSpritePlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/sd')],
        // 指定symbolId格式
        symbolId: (name: string, dir?: string) => (dir ? `icon-${dir}-${name}` : `icon-${name}`),
        customDomId: '__svg__icons__speed__knowledge__',
      }),
    ],
    resolve: {
      alias: {
        '#sk-web': fileURLToPath(new URL('./src', import.meta.url)),
        '@': fileURLToPath(new URL('../../../speed-components/src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        [apiBaseUrl]: {
          target: apiProxyUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiBaseUrl}`), ''),
        },
      },
    },
  })
}
