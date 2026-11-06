import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const speedBoardDir = path.resolve(rootDir, '../speed-board')

const packages = [
  { name: 'vue3-antd', src: path.join(speedBoardDir, 'packages/vue3-antd') },
  { name: 'vue3', src: path.join(speedBoardDir, 'packages/vue3') },
  { name: 'core', src: path.join(speedBoardDir, 'packages/core') },
  { name: 'shared', src: path.join(speedBoardDir, 'packages/shared') },
  { name: 'extension-draw', src: path.join(speedBoardDir, 'packages/extensions/extension-draw') },
  { name: 'extension-mindmap', src: path.join(speedBoardDir, 'packages/extensions/extension-mindmap') },
]

const targetDirs = [
  path.resolve(rootDir, 'node_modules/@speed-board'),
  path.resolve(rootDir, 'apps/web/node_modules/@speed-board'),
]

for (const targetDir of targetDirs) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  for (const pkg of packages) {
    const dest = path.join(targetDir, pkg.name)
    try {
      fs.rmSync(dest, { recursive: true, force: true })
    } catch {}
    try {
      fs.symlinkSync(pkg.src, dest, 'junction')
      console.log(`[link-speed-board] Linked @speed-board/${pkg.name} -> ${pkg.src}`)
    } catch (err) {
      console.error(`[link-speed-board] Failed to link ${pkg.name}:`, err.message)
    }
  }
}

