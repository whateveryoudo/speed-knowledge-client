import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from '@unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { createSimpleSvgSpritePlugin } from './vitePlugins/simple-svg-sprinte'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

const require = createRequire(import.meta.url)

const yjsRoot = path.dirname(require.resolve('yjs/package.json'))
const yjsEntry = path.join(yjsRoot, 'dist/yjs.mjs')
const lib0Root = path.dirname(
  require.resolve('lib0/package.json', { paths: [yjsRoot, path.dirname(yjsRoot)] }),
)

/** 本地联调 speed-components build 产物（pnpm build:lib 后生效，不走 src） */
function speedComponentsDistAliases() {
  const toDist = true
  const packagePrefix = toDist
    ? fileURLToPath(new URL('../../../speed-components/dist', import.meta.url))
    : fileURLToPath(new URL('../../../speed-components/src', import.meta.url))
  return toDist
    ? {
        'speed-components-ui/components': `${packagePrefix}/components.es.js`,
        'speed-components-ui/hooks': `${packagePrefix}/hooks.es.js`,
        'speed-components-ui/dist/style.css': `${packagePrefix}/style.css`,
      }
    : {
        'speed-components-ui/components': `${packagePrefix}/components/index.ts`,
        'speed-components-ui/hooks': `${packagePrefix}/hooks/index.ts`,
      }
}

// yjs 必须是单例：alias 到 speed-sheet 源码时，否则会解析到 speed-sheet 仓库自己的 yjs
const singletonPackages = {
  yjs: yjsEntry,
  lib0: lib0Root,
} as const

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyUrl = env.VITE_APP_PROXY_URL ?? 'http://localhost:8005'
  const apiBaseUrl = env.VITE_API_BASE_URL ?? '/api'
  return {
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
      dedupe: ['yjs', 'y-protocols', 'lib0'],
      alias: {
        ...singletonPackages,
        '#sk-web': fileURLToPath(new URL('./src', import.meta.url)),
        ...(mode === 'development'
          ? {
              '@sc': fileURLToPath(new URL('../../../speed-components/src', import.meta.url)),
              '@st': fileURLToPath(new URL('../../../speed-tiptap-editor/src', import.meta.url)),
              ...speedComponentsDistAliases(),
              '@speed-sheet/vue3-antd': fileURLToPath(
                new URL('../../../speed-sheet/packages/vue3-antd/src/index.ts', import.meta.url),
              ),
              '@speed-sheet/core': fileURLToPath(
                new URL('../../../speed-sheet/packages/core/src/index.ts', import.meta.url),
              ),
              '@speed-sheet/vue3': fileURLToPath(
                new URL('../../../speed-sheet/packages/vue3/src/index.ts', import.meta.url),
              ),
              '@speed-sheet/shared': fileURLToPath(
                new URL('../../../speed-sheet/packages/shared/src/index.ts', import.meta.url),
              ),
              '@speed-sheet/extension-formula': fileURLToPath(
                new URL(
                  '../../../speed-sheet/packages/extensions/extension-formula/src/index.ts',
                  import.meta.url,
                ),
              ),
            }
          : {}),
      },
    },
    // 增加对speed-components-ui和speed-tiptap-editor的优化排除，避免预构建导致pnpm link失效
    optimizeDeps: {
      exclude: [
        'yjs',
        '@hocuspocus/provider',
        'speed-components-ui',
        '@speed-sheet/vue3-antd',
        '@speed-sheet/core',
        '@speed-sheet/vue3',
        '@speed-sheet/shared',
        '@speed-sheet/extension-formula',
      ],
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
  }
})
