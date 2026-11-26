/**
 * 素材库：图片、视频、配音、成片都落在 <数据目录>/media/<项目ID>/ 下，
 * 每个项目一个 index.json 记录来源（提示词、引擎、对应镜头）。
 */
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { EXT_BY_MIME, MIME_BY_EXT, httpError, imageSize, safeSegment, sniffMime, uid } from './util.js'

export function createMedia(root) {
  const mediaRoot = path.join(root, 'media')
  let chain = Promise.resolve()
  const serial = (fn) => {
    const next = chain.catch(() => {}).then(fn)
    chain = next
    return next
  }

  const projectDir = (pid) => {
    const safe = safeSegment(pid)
    if (!safe) throw httpError(400, '项目 ID 不合法')
    return path.join(mediaRoot, safe)
  }

  /** 把 {pid, file} 解析成磁盘路径；拒绝任何越界写法。 */
  function resolve(ref) {
    const file = safeSegment(ref?.file)
    if (!file) throw httpError(400, '素材文件名不合法')
    return path.join(projectDir(ref.pid), file)
  }

  async function readIndex(pid) {
    try {
      const list = JSON.parse(await fs.readFile(path.join(projectDir(pid), 'index.json'), 'utf8'))
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }

  async function writeIndex(pid, list) {
    const dir = projectDir(pid)
    await fs.mkdir(dir, { recursive: true })
    const tmp = path.join(dir, `index.json.${process.pid}.tmp`)
    await fs.writeFile(tmp, JSON.stringify(list), 'utf8')
    await fs.rename(tmp, path.join(dir, 'index.json'))
  }

  /**
   * 存一份素材并登记。
   * @param meta kind(image|video|audio|render)、source(ai|upload|sketch|local)、provider、model、prompt、target…
   * @returns 可写进项目数据的引用 { id, pid, file, kind, mime, w, h, dur, source, provider, createdAt }
   */
  async function save(pid, buffer, meta = {}) {
    if (!buffer?.length) throw new Error('素材内容为空')
    const mime = sniffMime(buffer) || meta.mime
    const ext = EXT_BY_MIME[mime]
    if (!ext) throw httpError(415, '不支持的素材格式（支持 PNG / JPEG / WebP / GIF / MP4 / WebM / MP3 / M4A / WAV）')
    const kind = meta.kind || (mime.startsWith('image/') ? 'image' : mime.startsWith('video/') ? 'video' : 'audio')
    const id = uid(kind[0])
    const file = `${id}.${ext}`
    const dir = projectDir(pid)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, file), buffer)
    const size = mime.startsWith('image/') ? imageSize(buffer) : null
    const record = {
      id, pid, file, kind, mime,
      bytes: buffer.length,
      w: meta.w ?? size?.width ?? null,
      h: meta.h ?? size?.height ?? null,
      dur: meta.dur ?? null,
      source: meta.source || 'ai',
      provider: meta.provider || '',
      model: meta.model || '',
      prompt: meta.prompt ? String(meta.prompt).slice(0, 4000) : '',
      target: meta.target || null,
      createdAt: Date.now(),
    }
    await serial(async () => {
      const list = await readIndex(pid)
      list.push(record)
      await writeIndex(pid, list)
    })
    return toRef(record)
  }

  /** 把磁盘上已有的文件（例如 ffmpeg 输出）移入素材库。 */
  async function adopt(pid, sourcePath, meta = {}) {
    const buffer = await fs.readFile(sourcePath)
    const ref = await save(pid, buffer, meta)
    await fs.rm(sourcePath, { force: true })
    return ref
  }

  function toRef(record) {
    return {
      id: record.id, pid: record.pid, file: record.file, kind: record.kind, mime: record.mime,
      w: record.w, h: record.h, dur: record.dur,
      source: record.source, provider: record.provider, createdAt: record.createdAt,
    }
  }

  async function list(pids) {
    const all = []
    for (const pid of pids) {
      if (!safeSegment(pid)) continue
      all.push(...await readIndex(pid))
    }
    return all.sort((a, b) => b.createdAt - a.createdAt)
  }

  async function remove(ref) {
    const target = resolve(ref)
    await fs.rm(target, { force: true })
    await serial(async () => {
      const current = await readIndex(ref.pid)
      await writeIndex(ref.pid, current.filter((item) => item.file !== ref.file))
    })
  }

  /** GET /media/<pid>/<file>，支持 Range（视频拖动进度条要用）。 */
  async function serve(req, res, pid, file) {
    const target = resolve({ pid, file })
    let stat
    try {
      stat = await fs.stat(target)
    } catch {
      throw httpError(404, '素材不存在')
    }
    const mime = MIME_BY_EXT[path.extname(target).slice(1).toLowerCase()] || 'application/octet-stream'
    const headers = {
      'content-type': mime,
      'accept-ranges': 'bytes',
      // 文件名里带随机 ID，内容不会变，可以放心长缓存。
      'cache-control': 'private, max-age=31536000, immutable',
    }
    const download = new URL(req.url, 'http://local').searchParams.get('download')
    if (download) headers['content-disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(download)}`
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''))
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]))
      let end = range[1] && range[2] ? Number(range[2]) : stat.size - 1
      end = Math.min(end, stat.size - 1)
      if (!(start <= end)) {
        res.writeHead(416, { 'content-range': `bytes */${stat.size}` })
        res.end()
        return
      }
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${stat.size}`, 'content-length': end - start + 1 })
      if (req.method === 'HEAD') { res.end(); return }
      createReadStream(target, { start, end }).pipe(res)
      return
    }
    res.writeHead(200, { ...headers, 'content-length': stat.size })
    if (req.method === 'HEAD') { res.end(); return }
    createReadStream(target).pipe(res)
  }

  return { root: mediaRoot, resolve, save, adopt, list, remove, serve, projectDir }
}
