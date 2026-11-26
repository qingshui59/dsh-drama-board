/**
 * 独立运行：不装 Harness 也能用完整的工作台（出图、配音、合成都可用）。
 * 文本生成需要在「生成引擎 → 文本模型」里填自己的 API Key。
 *
 *   npm run dev                         → http://127.0.0.1:4173
 *   DRAMA_PREVIEW_PORT=4174 npm run dev → 换端口
 *   DRAMA_PREVIEW_HOME=/some/dir        → 换数据目录（默认 ~/.dsh/drama-board-preview）
 */
import http from 'node:http'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PREFIX, createApp } from '../host/app.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.DRAMA_PREVIEW_PORT || 4173)
const dataRoot = process.env.DRAMA_PREVIEW_HOME || path.join(os.homedir(), '.dsh', 'drama-board-preview')
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
}

const app = createApp({ root: dataRoot, log: (line) => console.warn(line) })

// 第一次启动时放入示例项目，方便直接上手。
try {
  await fs.access(app.stateFile)
} catch {
  await fs.mkdir(dataRoot, { recursive: true })
  await fs.copyFile(path.join(root, 'preview', 'demo.json'), app.stateFile)
}
app.boot()

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) { await app.handle(req, res); return }
    if (pathname === '/') { res.writeHead(302, { location: '/preview/index.html' }); res.end(); return }
    const file = path.resolve(root, '.' + pathname)
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return }
    const content = await fs.readFile(file)
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(content)
  } catch {
    if (!res.headersSent) res.writeHead(404)
    res.end('Not found')
  }
})
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已占用。可使用 DRAMA_PREVIEW_PORT=4174 npm run dev。` : error.message)
  process.exitCode = 1
})
server.listen(port, '127.0.0.1', () => {
  console.log(`映序 Studio：http://127.0.0.1:${port}/preview/index.html`)
  console.log(`数据目录：${dataRoot}（与 Harness 里的项目相互独立）`)
})
