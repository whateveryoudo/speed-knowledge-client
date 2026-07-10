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
const editorRoot = fileURLToPath(new URL('../../../speed-tiptap-editor', import.meta.url))
const editorPkg = (name: string) =>
  fileURLToPath(new URL(`../../../speed-tiptap-editor/packages/${name}`, import.meta.url))
const editorExtPkg = (name: string) =>
  fileURLToPath(
    new URL(`../../../speed-tiptap-editor/packages/extensions/${name}`, import.meta.url),
  )

/** 本地联调 speed-tiptap-editor（toDist: true 走 dist，false 走 src） */
function speedTiptapEditorAliases() {
  const toDist = true
  const entry = (name: string, file = 'index.ts') =>
    `${editorPkg(name)}/${toDist ? `dist/${file.replace(/\.ts$/, '.js')}` : `src/${file}`}`
  const extEntry = (name: string, file = 'index.ts') =>
    `${editorExtPkg(name)}/${toDist ? `dist/${file.replace(/\.ts$/, '.js')}` : `src/${file}`}`
  const cssEntry = (name: string, file = 'style.css') =>
    `${editorPkg(name)}/dist/${file}`

  if (toDist) {
    return {
      '@speed-tiptap-editor/base-editor/style.css': cssEntry('base-editor'),
      '@speed-tiptap-editor/base-editor/plugin': entry('base-editor', 'plugin.js'),
      '@speed-tiptap-editor/base-editor': entry('base-editor'),
      '@speed-tiptap-editor/lite-editor': entry('lite-editor'),
      '@speed-tiptap-editor/knowledge-editor/style.css': cssEntry('knowledge-editor'),
      '@speed-tiptap-editor/knowledge-editor': entry('knowledge-editor'),
      '@speed-tiptap-editor/collaboration-editor': entry('collaboration-editor'),
      '@speed-tiptap-editor/shared': entry('shared'),
      '@speed-tiptap-editor/ui': entry('ui'),
      '@speed-tiptap-editor/composables': entry('composables'),
      '@speed-tiptap-editor/document-io': entry('document-io'),
      '@speed-tiptap-editor/schema': entry('schema'),
      '@speed-tiptap-editor/kit-base': entry('kit-base'),
      '@speed-tiptap-editor/extension-kit': extEntry('extension-kit'),
      '@speed-tiptap-editor/extension-import-export': extEntry('extension-import-export'),
      '@speed-tiptap-editor/extension-mind': extEntry('extension-mind'),
      '@speed-tiptap-editor/extension-flow': extEntry('extension-flow'),
    }
  }

  return {
    '@speed-tiptap-editor/base-editor/style.css': `${editorPkg('base-editor')}/src/style.ts`,
    '@speed-tiptap-editor/base-editor/plugin': `${editorPkg('base-editor')}/src/plugin-entry.ts`,
    '@speed-tiptap-editor/base-editor': `${editorPkg('base-editor')}/src/index.ts`,
    '@speed-tiptap-editor/lite-editor': `${editorPkg('lite-editor')}/src/index.ts`,
    '@speed-tiptap-editor/knowledge-editor/style.css': `${editorPkg('knowledge-editor')}/src/style.ts`,
    '@speed-tiptap-editor/knowledge-editor': `${editorPkg('knowledge-editor')}/src/index.ts`,
    '@speed-tiptap-editor/collaboration-editor': `${editorPkg('collaboration-editor')}/src/index.ts`,
    '@speed-tiptap-editor/shared': `${editorPkg('shared')}/src/index.ts`,
    '@speed-tiptap-editor/ui': `${editorPkg('ui')}/src/index.ts`,
    '@speed-tiptap-editor/composables': `${editorPkg('composables')}/src/index.ts`,
    '@speed-tiptap-editor/document-io': `${editorPkg('document-io')}/src/index.ts`,
    '@speed-tiptap-editor/schema': `${editorPkg('schema')}/src/index.ts`,
    '@speed-tiptap-editor/kit-base': `${editorPkg('kit-base')}/src/index.ts`,
    '@speed-tiptap-editor/extension-kit': `${editorExtPkg('extension-kit')}/src/index.ts`,
    '@speed-tiptap-editor/extension-import-export': `${editorExtPkg('extension-import-export')}/src/index.ts`,
    '@speed-tiptap-editor/extension-mind': `${editorExtPkg('extension-mind')}/src/index.ts`,
    '@speed-tiptap-editor/extension-flow': `${editorExtPkg('extension-flow')}/src/index.ts`,
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
        ...(mode === 'development'
          ? {
              '@sc': fileURLToPath(new URL('../../../speed-components/src', import.meta.url)),
              ...speedTiptapEditorAliases(),
              ...speedComponentsDistAliases(),
              ...speedSheetSourceAliases,
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
        // '@speed-tiptap-editor/base-editor',
        // '@speed-tiptap-editor/lite-editor',
        // '@speed-tiptap-editor/knowledge-editor',
        // '@speed-tiptap-editor/collaboration-editor',
        // '@speed-tiptap-editor/composables',
        // '@speed-tiptap-editor/kit-base',
        // '@speed-tiptap-editor/extension-kit',
        // '@speed-tiptap-editor/document-io',
        // '@speed-tiptap-editor/shared',
        // '@speed-tiptap-editor/ui',
      ],
    },
    server: {
      fs: {
        allow: [editorRoot, fileURLToPath(new URL('../../..', import.meta.url))],
      },
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
