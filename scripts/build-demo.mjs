/**
 * 生成 docs/ 静态演示页：GitHub Pages 上不需要后端，也能点开看到完整界面。
 *
 *   npm run build:demo
 *
 * docs/index.html 是手写的（含一个把 /drama-board/api 请求接住的假后端），
 * 这个脚本只负责把 client.js、React 和示例数据同步进去。
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_SETTINGS } from '../host/app.js'
import { CATALOG } from '../host/providers.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docs = path.join(root, 'docs')

await fs.mkdir(path.join(docs, 'vendor'), { recursive: true })

const copy = (from, to) => fs.copyFile(path.join(root, from), path.join(docs, to))
await copy('client.js', 'client.js')
await copy('icon.svg', 'icon.svg')
await copy('preview/vendor/react.js', 'vendor/react.js')
await copy('preview/vendor/react-dom.js', 'vendor/react-dom.js')
await fs.writeFile(path.join(docs, '.nojekyll'), '', 'utf8')

const state = JSON.parse(await fs.readFile(path.join(root, 'preview', 'demo.json'), 'utf8'))
const settings = structuredClone(DEFAULT_SETTINGS)
for (const key of CATALOG.keys) settings.keys[key.id] = { set: false, hint: '' }

const view = {
  settings,
  catalog: CATALOG,
  // 浏览器里没有 ffmpeg、系统语音和本机模型，按「都没有」告诉界面。
  tools: {
    ffmpeg: false, ffmpegPath: '', ffmpegVersion: '', encoder: '',
    subtitles: false, motion: false, systemVoice: false, platform: 'web',
  },
  voices: [],
  harness: { available: false, model: null },
  dataDir: '浏览器本地存储（localStorage）',
}

const payload = { state, settings: view }
const file = `// 由 scripts/build-demo.mjs 生成。示例项目来自 preview/demo.json，引擎目录来自 host/providers.js。
window.__DEMO__ = ${JSON.stringify(payload)}
`
await fs.writeFile(path.join(docs, 'demo-data.js'), file, 'utf8')
console.log(`docs/demo-data.js ← ${state.projects.length} 个示例项目、${CATALOG.image.length} 个出图引擎（${(file.length / 1024).toFixed(0)} KB）`)
