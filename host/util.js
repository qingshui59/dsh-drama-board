/**
 * 通用小工具：HTTP 读写、子进程、可执行文件定位。
 * 这里不依赖 Harness，独立预览服务与插件 Host 共用。
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

/** 带 HTTP 状态码的错误。 */
export function httpError(status, message) {
  return Object.assign(new Error(message), { status })
}

/** 写 JSON 响应。 */
export function sendJson(res, value, status = 200) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

/** 读取原始请求体，超过上限即中止。 */
export async function readBody(req, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw httpError(413, `请求体过大（上限 ${Math.round(limit / 1024 / 1024)} MB）`)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/** 解析请求体 JSON（默认上限 8MB）。 */
export async function readJsonBody(req, limit = 8 * 1024 * 1024) {
  const text = (await readBody(req, limit)).toString('utf8')
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw httpError(400, '请求体不是合法 JSON')
  }
}

/** 只保留安全的文件名字符；用于项目 ID、素材文件名。 */
export function safeSegment(value) {
  const text = String(value ?? '')
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(text) && !text.includes('..') ? text : null
}

export async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

/**
 * 找可执行文件。桌面应用从访达启动时 PATH 很短（没有 /opt/homebrew/bin），
 * 所以除了 PATH 还要看常见安装位置。
 */
export async function findBinary(name, preferred) {
  const candidates = []
  if (preferred) candidates.push(preferred)
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (dir) candidates.push(path.join(dir, name))
  }
  for (const dir of ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/opt/local/bin']) {
    candidates.push(path.join(dir, name))
  }
  for (const candidate of candidates) {
    try {
      await fs.access(candidate, fs.constants.X_OK)
      return candidate
    } catch { /* 继续找 */ }
  }
  return null
}

/**
 * 运行子进程并收集输出。
 * @param onStdout 可选：逐块接收 stdout（用于解析 ffmpeg -progress）。
 */
export function run(command, args, { cwd, signal, onStdout, timeoutMs = 15 * 60_000, input } = {}) {
  return new Promise((resolve, reject) => {
    let child
    try {
      child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] })
    } catch (error) {
      reject(new Error(`无法启动 ${path.basename(command)}：${error.message}`))
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      fn(value)
    }
    const onAbort = () => {
      child.kill('SIGKILL')
      finish(reject, Object.assign(new Error('已取消'), { canceled: true }))
    }
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      finish(reject, new Error(`${path.basename(command)} 运行超时`))
    }, timeoutMs)
    if (signal?.aborted) { onAbort(); return }
    signal?.addEventListener('abort', onAbort)
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString('utf8')
      if (onStdout) onStdout(text)
      else if (stdout.length < 2_000_000) stdout += text
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8')
      if (stderr.length > 200_000) stderr = stderr.slice(-100_000)
    })
    child.on('error', (error) => finish(reject, new Error(`无法运行 ${path.basename(command)}：${error.message}`)))
    child.on('close', (code) => {
      if (code === 0) finish(resolve, { stdout, stderr })
      else {
        const tail = stderr.trim().split('\n').slice(-6).join('\n')
        finish(reject, new Error(`${path.basename(command)} 退出码 ${code}${tail ? `：\n${tail}` : ''}`))
      }
    })
    if (input !== undefined) child.stdin.end(input)
    else child.stdin.end()
  })
}

export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) { reject(Object.assign(new Error('已取消'), { canceled: true })); return }
  const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve() }, ms)
  const onAbort = () => { clearTimeout(timer); reject(Object.assign(new Error('已取消'), { canceled: true })) }
  signal?.addEventListener('abort', onAbort, { once: true })
})

/** 从文件头判断常见图片/音视频类型。 */
export function sniffMime(buffer) {
  if (!buffer || buffer.length < 12) return null
  const hex = buffer.subarray(0, 12).toString('hex')
  const ascii = buffer.subarray(0, 12).toString('latin1')
  if (hex.startsWith('89504e470d0a1a0a')) return 'image/png'
  if (hex.startsWith('ffd8ff')) return 'image/jpeg'
  if (ascii.startsWith('GIF8')) return 'image/gif'
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp'
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WAVE') return 'audio/wav'
  if (ascii.slice(4, 8) === 'ftyp') {
    const brand = ascii.slice(8, 12)
    if (brand.startsWith('M4A')) return 'audio/mp4'
    return 'video/mp4'
  }
  if (hex.startsWith('1a45dfa3')) return 'video/webm'
  if (ascii.startsWith('ID3') || hex.startsWith('fffb') || hex.startsWith('fff3')) return 'audio/mpeg'
  if (ascii.startsWith('OggS')) return 'audio/ogg'
  return null
}

export const EXT_BY_MIME = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav', 'audio/ogg': 'ogg',
}
export const MIME_BY_EXT = Object.fromEntries(Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime]))

/** PNG / JPEG 的像素尺寸（其他格式返回 null，交给 ffprobe）。 */
export function imageSize(buffer) {
  try {
    if (buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) { offset += 1; continue }
        const marker = buffer[offset + 1]
        const length = buffer.readUInt16BE(offset + 2)
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) }
        }
        offset += 2 + length
      }
    }
  } catch { /* 读不出就算了 */ }
  return null
}
