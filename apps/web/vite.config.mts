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
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

const require = createRequire(import.meta.url)
const editorRoot = fileURLToPath(new URL('../../../speed-editor', import.meta.url))
const editorPkg = (name: string) =>
  fileURLToPath(new URL(`../../../speed-editor/packages/${name}`, import.meta.url))
const editorExtPkg = (name: string) =>
  fileURLToPath(
    new URL(`../../../speed-editor/packages/extensions/${name}`, import.meta.url),
  )

/** 本地联调 speed-editor（toDist: true 走 dist，false 走 src） */
function speedTiptapEditorAliases() {
  const toDist = false
  const entry = (name: string, file = 'index.ts') =>
    `${editorPkg(name)}/${toDist ? `dist/${file.replace(/\.ts$/, '.js')}` : `src/${file}`}`
  const extEntry = (name: string, file = 'index.ts') =>
    `${editorExtPkg(name)}/${toDist ? `dist/${file.replace(/\.ts$/, '.js')}` : `src/${file}`}`
  const cssEntry = (name: string, file = 'style.css') =>
    `${editorPkg(name)}/dist/${file}`

  if (toDist) {
    return {
      '@speed-editor/base-editor/style.css': cssEntry('base-editor'),
      '@speed-editor/ui/style.css': cssEntry('ui'),
      '@speed-editor/kit-base/style.css': cssEntry('kit-base'),
      '@speed-editor/extension-kit/style.css': `${editorExtPkg('extension-kit')}/dist/style.css`,
      '@speed-editor/base-editor/plugin': entry('base-editor', 'plugin.js'),
      '@speed-editor/lite-editor/plugin': entry('lite-editor', 'plugin.js'),
      '@speed-editor/knowledge-editor/plugin': entry('knowledge-editor', 'plugin.js'),
      '@speed-editor/base-editor': entry('base-editor'),
      '@speed-editor/lite-editor/style.css': cssEntry('lite-editor'),
      '@speed-editor/lite-editor': entry('lite-editor'),
      '@speed-editor/knowledge-editor/style.css': cssEntry('knowledge-editor'),
      '@speed-editor/knowledge-editor': entry('knowledge-editor'),
      '@speed-editor/collaboration-editor': entry('collaboration-editor'),
      '@speed-editor/shared': entry('shared'),
      '@speed-editor/ui': entry('ui'),
      '@speed-editor/composables': entry('composables'),
      '@speed-editor/document-io': entry('document-io'),
      '@speed-editor/schema': entry('schema'),
      '@speed-editor/kit-base': entry('kit-base'),
      '@speed-editor/extension-kit': extEntry('extension-kit'),
      '@speed-editor/extension-import-export': extEntry('extension-import-export'),
      '@speed-editor/extension-mind': extEntry('extension-mind'),
      '@speed-editor/extension-flow': extEntry('extension-flow'),
    }
  }

  return {
    '@speed-editor/base-editor/style.css': `${editorPkg('base-editor')}/src/style.ts`,
    '@speed-editor/ui/style.css': `${editorPkg('ui')}/src/style.ts`,
    '@speed-editor/kit-base/style.css': `${editorPkg('kit-base')}/src/style.ts`,
    '@speed-editor/extension-kit/style.css': `${editorExtPkg('extension-kit')}/src/style.ts`,
    '@speed-editor/base-editor/plugin': `${editorPkg('base-editor')}/src/plugin-entry.ts`,
    '@speed-editor/lite-editor/plugin': `${editorPkg('lite-editor')}/src/plugin-entry.ts`,
    '@speed-editor/knowledge-editor/plugin': `${editorPkg('knowledge-editor')}/src/plugin-entry.ts`,
    '@speed-editor/base-editor': `${editorPkg('base-editor')}/src/index.ts`,
    '@speed-editor/lite-editor/style.css': `${editorPkg('lite-editor')}/src/style.ts`,
    '@speed-editor/lite-editor': `${editorPkg('lite-editor')}/src/index.ts`,
    '@speed-editor/knowledge-editor/style.css': `${editorPkg('knowledge-editor')}/src/style.ts`,
    '@speed-editor/knowledge-editor': `${editorPkg('knowledge-editor')}/src/index.ts`,
    '@speed-editor/collaboration-editor': `${editorPkg('collaboration-editor')}/src/index.ts`,
    '@speed-editor/shared': `${editorPkg('shared')}/src/index.ts`,
    '@speed-editor/ui': `${editorPkg('ui')}/src/index.ts`,
    '@speed-editor/composables': `${editorPkg('composables')}/src/index.ts`,
    '@speed-editor/document-io': `${editorPkg('document-io')}/src/index.ts`,
    '@speed-editor/schema': `${editorPkg('schema')}/src/index.ts`,
    '@speed-editor/kit-base': `${editorPkg('kit-base')}/src/index.ts`,
    '@speed-editor/extension-kit': `${editorExtPkg('extension-kit')}/src/index.ts`,
    '@speed-editor/extension-import-export': `${editorExtPkg('extension-import-export')}/src/index.ts`,
    '@speed-editor/extension-mind': `${editorExtPkg('extension-mind')}/src/index.ts`,
    '@speed-editor/extension-flow': `${editorExtPkg('extension-flow')}/src/index.ts`,
    // 包内 tsconfig paths（仅 src 模式）
    '@kb': `${editorPkg('kit-base')}/src`,
    '@ek': `${editorExtPkg('extension-kit')}/src`,
  }
}

/** 本地联调 speed-components build 产物（pnpm build:lib 后生效，不走 src） */
function speedComponentsDistAliases() {
  const toDist = false
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

/** 本地联调 speed-sheet 源码（development 下 spread 进 alias） */
const speedSheetSourceAliases = {
  // 须在 @speed-sheet/vue3 之前，避免子路径 style.css 解析失败
  '@speed-sheet/vue3/style.css': fileURLToPath(
    new URL('../../../speed-sheet/packages/vue3/dist/style.css', import.meta.url),
  ),
  '@speed-sheet/vue3-antd/style.css': fileURLToPath(
    new URL('../../../speed-sheet/packages/vue3-antd/dist/style.css', import.meta.url),
  ),
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
  '@speed-sheet/extension-chart': fileURLToPath(
    new URL(
      '../../../speed-sheet/packages/extensions/extension-chart/src/index.ts',
      import.meta.url,
    ),
  ),
} as const

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const analyze = env.VITE_BUILD_ANALYZE === '1'
  const apiProxyUrl = env.VITE_APP_PROXY_URL ?? 'http://localhost:8005'
  const apiBaseUrl = env.VITE_API_BASE_URL ?? '/api'
  return {
    plugins: [
      vue(),
      vueJsx(),
      ...(mode === 'development' ? [vueDevTools()] : []),
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
      // ...其他插件
      mode === 'production' &&
        analyze &&
        visualizer({
          open: true, // build 完自动打开浏览器
          filename: 'dist/stats.html', // 输出路径
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // 或 'sunburst'、'network'
        }),
    ],
    resolve: {
      // 单例敏感库：宿主 package.json 安装 peer（yjs / @tiptap/core / @tiptap/pm / @tiptap/vue-3 等）。
      // dedupe 是 dev 打包时的兜底，避免源码 alias 仍解析到多份模块。
      // prosemirror-* / y-protocols / lib0 不必写进 package.json——由 @tiptap/pm、yjs 传递；dedupe 仅防深层重复引用。
      dedupe: [
        'yjs',
        '@tiptap/core',
        '@tiptap/pm',
        '@tiptap/vue-3',
        'prosemirror-view',
        'prosemirror-state',
        'prosemirror-model',
        'y-protocols',
        'lib0',
        '@tiptap/y-tiptap',
      ],
      alias: {
        '#sk-web': fileURLToPath(new URL('./src', import.meta.url)),
        ...speedTiptapEditorAliases(),
        ...speedComponentsDistAliases(),
        ...speedSheetSourceAliases,
        ...(mode === 'development'
          ? {
              '@sc': fileURLToPath(new URL('../../../speed-components/src', import.meta.url)),
            }
          : {}),
      },
    },
    optimizeDeps: {
      exclude: [
        // 'speed-components-ui',
        // '@speed-sheet/vue3-antd',
        // '@speed-sheet/core',
        // '@speed-sheet/vue3',
        // '@speed-sheet/shared',
        // '@speed-sheet/extension-formula',
        // '@speed-editor/base-editor',
        // '@speed-editor/lite-editor',
        // '@speed-editor/knowledge-editor',
        // '@speed-editor/collaboration-editor',
        // '@speed-editor/composables',
        // '@speed-editor/kit-base',
        // '@speed-editor/extension-kit',
        // '@speed-editor/document-io',
        // '@speed-editor/shared',
        // '@speed-editor/ui',
      ],
    },
    server: {
      fs: {
        allow: [editorRoot, fileURLToPath(new URL('../../..', import.meta.url))],
      },
      proxy: {
        [apiBaseUrl]: {
          target: apiProxyUrl,
          changeOrigin: false,
          rewrite: (path) => path.replace(new RegExp(`^${apiBaseUrl}`), ''),
        },
      },
    },
  }
})
