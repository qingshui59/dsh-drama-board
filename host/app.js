/**
 * 映序 Studio 的后端：一个与宿主无关的 (req, res) 处理器。
 * Harness 插件（index.js）和独立预览（preview/server.mjs）都挂这一份。
 *
 *   GET  /state               读取工作区          POST /state            保存工作区
 *   POST /generate            文本生成（大纲/角色/分集/分镜/发布文案）
 *   GET  /settings            引擎配置与本机能力   POST /settings         保存引擎配置
 *   POST /settings/test       试一次出图 / 配音 / 文本
 *   GET  /jobs                任务列表            POST /jobs             新建任务（出图/视频/配音/合成）
 *   POST /jobs/cancel         取消                POST /jobs/ack         确认已取回结果
 *   GET  /media/<pid>/<file>  读素材（支持 Range） POST /media/upload     上传素材
 *   GET  /assets?pids=a,b     素材清单            POST /media/delete     删除素材
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { createJobs } from './jobs.js'
import { createMedia } from './media.js'
import { BUILDERS, SYSTEM, parseJsonReply } from './prompts.js'
import { CATALOG, completeText, generateImage, generateVideo, synthesizeSpeech } from './providers.js'
import { createStudio } from './studio.js'
import { httpError, readBody, readJsonBody, safeSegment, sendJson } from './util.js'

export const PREFIX = '/drama-board/api'

/** 默认引擎配置；docs/ 的在线演示也直接读这份，避免两处各写一份默认值。 */
export const DEFAULT_SETTINGS = {
  keys: {},
  text: { mode: 'harness', vendor: 'deepseek', baseUrl: '', model: '' },
  image: { vendor: 'none', baseUrl: '', model: '', useRefs: true },
  video: { vendor: 'local', baseUrl: '', model: '', duration: 5 },
  tts: { vendor: 'system', baseUrl: '', model: '', voice: '', rate: 190, speed: 1 },
  render: { ffmpegPath: '', width: 720, fps: 30, subtitles: true, fitAudio: true, titleCard: true, bgmVolume: 0.22 },
}

const maskKey = (value) => {
  const text = String(value || '')
  if (!text) return { set: false, hint: '' }
  return { set: true, hint: text.length > 8 ? `${text.slice(0, 3)}…${text.slice(-4)}` : '已填写' }
}

export function createApp({ root, harness = null, log = () => {} }) {
  const stateFile = path.join(root, 'projects.json')
  const settingsFile = path.join(root, 'settings.json')
  const apiLog = path.join(root, 'api.log')
  const media = createMedia(root)

  //#region 设置
  let settingsCache = null
  async function getSettings() {
    if (settingsCache) return settingsCache
    let stored = {}
    try {
      stored = JSON.parse(await fs.readFile(settingsFile, 'utf8')) || {}
    } catch { /* 第一次使用还没有配置文件 */ }
    settingsCache = {
      keys: { ...(stored.keys || {}) },
      text: { ...DEFAULT_SETTINGS.text, ...(stored.text || {}) },
      image: { ...DEFAULT_SETTINGS.image, ...(stored.image || {}) },
      video: { ...DEFAULT_SETTINGS.video, ...(stored.video || {}) },
      tts: { ...DEFAULT_SETTINGS.tts, ...(stored.tts || {}) },
      render: { ...DEFAULT_SETTINGS.render, ...(stored.render || {}) },
    }
    return settingsCache
  }

  async function saveSettings(patch) {
    const current = await getSettings()
    const next = { ...current, keys: { ...current.keys } }
    for (const section of ['text', 'image', 'video', 'tts', 'render']) {
      if (patch?.[section] && typeof patch[section] === 'object') {
        const clean = {}
        for (const [key, value] of Object.entries(patch[section])) {
          if (key in DEFAULT_SETTINGS[section] && ['string', 'number', 'boolean'].includes(typeof value)) clean[key] = value
        }
        next[section] = { ...current[section], ...clean }
      }
    }
    // 密钥：传字符串即更新，传 null 即删除，不传则保持原样（页面永远拿不到明文）。
    if (patch?.keys && typeof patch.keys === 'object') {
      for (const [name, value] of Object.entries(patch.keys)) {
        if (!/^[a-z][a-zA-Z0-9]{1,30}$/.test(name)) continue
        if (value === null) delete next.keys[name]
        else if (typeof value === 'string' && value.trim()) next.keys[name] = value.trim()
      }
    }
    await fs.mkdir(root, { recursive: true })
    const tmp = `${settingsFile}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), { encoding: 'utf8', mode: 0o600 })
    await fs.rename(tmp, settingsFile)
    await fs.chmod(settingsFile, 0o600).catch(() => {})
    settingsCache = next
    return next
  }

  async function settingsView() {
    const settings = await getSettings()
    const kit = await studio.tools()
    const harnessModel = harness?.model?.() || null
    return {
      settings: {
        ...settings,
        keys: Object.fromEntries(Object.entries(settings.keys).map(([name, value]) => [name, maskKey(value)])),
      },
      catalog: CATALOG,
      tools: {
        ffmpeg: Boolean(kit.ffmpeg), ffmpegPath: kit.ffmpeg || '', ffmpegVersion: kit.ffmpegVersion, encoder: kit.encoder,
        subtitles: Boolean(kit.filters?.ass), motion: Boolean(kit.filters?.zoompan),
        systemVoice: Boolean(kit.say && kit.afconvert), platform: process.platform,
      },
      voices: await studio.voices(),
      harness: { available: Boolean(harness), model: harnessModel },
      dataDir: root,
    }
  }
  //#endregion

  const studio = createStudio({ root, media, getSettings })

  //#region 工作区读写
  let writeChain = Promise.resolve()
  async function readState() {
    try {
      const parsed = JSON.parse(await fs.readFile(stateFile, 'utf8'))
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch (error) {
      if (error?.code !== 'ENOENT') log(`读取数据失败：${error?.message || error}`)
      return null
    }
  }
  function writeState(state) {
    writeChain = writeChain.catch(() => {}).then(async () => {
      await fs.mkdir(root, { recursive: true })
      const tmp = `${stateFile}.${process.pid}.tmp`
      await fs.writeFile(tmp, JSON.stringify(state), 'utf8')
      await fs.rename(tmp, stateFile)
    })
    return writeChain
  }
  //#endregion

  //#region 文本模型
  async function textModel() {
    const settings = await getSettings()
    if (settings.text.mode === 'custom' || !harness) {
      const vendor = CATALOG.text.find((item) => item.id === settings.text.vendor) || CATALOG.text[0]
      const key = settings.keys[vendor.key]
      if (!key) return null
      return { via: 'custom', provider: vendor.name, model: settings.text.model || vendor.models[0] }
    }
    const selection = harness.model?.()
    return selection?.provider && selection?.model ? { via: 'harness', ...selection } : null
  }

  async function runText(system, user, signal) {
    const settings = await getSettings()
    const model = await textModel()
    if (!model) {
      throw httpError(400, harness
        ? '还没有可用的模型：请先在 Harness「设置 → 模型」里登录，或在「生成引擎」里填写自己的文本模型。'
        : '独立运行时需要自己的文本模型：请到「生成引擎 → 文本模型」填写 API Key。')
    }
    if (model.via === 'harness') return harness.complete(system, user, signal)
    return completeText({ settings, system, user, signal })
  }
  //#endregion

  //#region 任务
  const readRef = async (ref) => {
    const file = media.resolve(ref)
    const buffer = await fs.readFile(file)
    return { buffer, mime: ref.mime || 'image/png', file }
  }

  const jobs = createJobs({
    log,
    handlers: {
      async image(payload, { update, signal }) {
        const settings = await getSettings()
        update(0.1, '提交出图请求')
        const refs = []
        if (settings.image.useRefs !== false) {
          for (const ref of (payload.refs || []).slice(0, 4)) {
            try { refs.push(await readRef(ref)) } catch { /* 参考图丢了就不带 */ }
          }
        }
        const ticker = setInterval(() => update(undefined, '正在出图'), 4000)
        try {
          const image = await generateImage({
            settings, prompt: payload.prompt, negative: payload.negative,
            width: payload.width || 720, height: payload.height || 1280, refs, signal, update,
          })
          update(0.9, '保存图片')
          const asset = await media.save(payload.pid, image.buffer, {
            kind: 'image', source: 'ai', provider: image.provider, model: image.model,
            prompt: payload.prompt, target: payload.target,
          })
          return { asset, usedRefs: image.usedRefs || 0 }
        } finally {
          clearInterval(ticker)
        }
      },

      async video(payload, { update, signal }) {
        const settings = await getSettings()
        update(0.05, '提交图生视频任务')
        let image = await readRef(payload.image)
        // 首帧统一压成 JPEG，避免超过各家接口的图片大小上限。
        if (image.buffer.length > 3 * 1024 * 1024 || !/jpe?g|png/.test(image.mime)) {
          const small = await studio.shrinkImage(image.file, signal)
          if (small) image = { ...image, buffer: small, mime: 'image/jpeg' }
        }
        const clip = await generateVideo({ settings, prompt: payload.prompt, image, duration: payload.duration, signal, update })
        update(0.95, '保存视频')
        const asset = await media.save(payload.pid, clip.buffer, {
          kind: 'video', source: 'ai', provider: clip.provider, model: clip.model,
          prompt: payload.prompt, target: payload.target,
        })
        const info = await studio.probe(media.resolve(asset))
        return { asset: { ...asset, dur: info.duration || null, w: info.width, h: info.height } }
      },

      async tts(payload, { update, signal }) {
        const settings = await getSettings()
        const text = String(payload.text || '').trim()
        if (!text) throw new Error('这个镜头没有可以朗读的台词。')
        update(0.2, '合成语音')
        let audio
        if (settings.tts.vendor === 'system') {
          audio = await studio.speakLocal({ text, voice: payload.voice || settings.tts.voice, rate: payload.rate || settings.tts.rate, signal })
          audio.provider = '系统语音'
          audio.model = payload.voice || settings.tts.voice || '默认'
        } else {
          audio = await synthesizeSpeech({ settings, text, voice: payload.voice, signal })
        }
        const asset = await media.save(payload.pid, audio.buffer, {
          kind: 'audio', source: 'ai', provider: audio.provider, model: audio.model, mime: audio.mime,
          prompt: text, target: payload.target, dur: audio.duration || null,
        })
        if (!asset.dur) asset.dur = (await studio.probe(media.resolve(asset))).duration || null
        return { asset }
      },

      render: (payload, context) => studio.renderEpisode(payload, context),
    },
  })
  //#endregion

  //#region 路由
  async function logLine(line) {
    try {
      await fs.mkdir(root, { recursive: true })
      await fs.appendFile(apiLog, `${new Date().toISOString()} ${line}\n`, 'utf8')
      const stat = await fs.stat(apiLog)
      if (stat.size > 256 * 1024) await fs.writeFile(apiLog, '', 'utf8')
    } catch { /* 日志失败可以忽略 */ }
  }

  /** 拒绝其他网站对本机接口发起的跨站写请求。 */
  function assertSameOrigin(req) {
    const origin = String(req.headers.origin || '')
    if (!origin || origin === 'null') return
    let parsed
    try { parsed = new URL(origin) } catch { return }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return
    if (parsed.host !== String(req.headers.host || '')) throw httpError(403, '已拒绝跨站请求')
  }

  const routes = {
    'GET /state': async (req, res) => {
      sendJson(res, { ok: true, state: await readState(), model: await textModel(), dataFile: stateFile })
    },
    'POST /state': async (req, res) => {
      const body = await readJsonBody(req, 32 * 1024 * 1024)
      if (!body || typeof body.state !== 'object' || body.state === null) throw httpError(400, '缺少 state')
      await writeState(body.state)
      sendJson(res, { ok: true, savedAt: Date.now() })
    },

    'POST /generate': async (req, res) => {
      const body = await readJsonBody(req)
      const kind = String(body?.kind || '')
      const builder = BUILDERS[kind]
      if (!builder) throw httpError(400, `不支持的生成类型：${kind || '(空)'}`)
      if (!body?.project || typeof body.project !== 'object') throw httpError(400, '缺少项目数据')
      const controller = new AbortController()
      res.on('close', () => { if (!res.writableEnded) controller.abort() })
      const text = await runText(SYSTEM, builder(body.project, body.episode, body.episodeIndex), controller.signal)
      let data
      try {
        data = parseJsonReply(text)
      } catch {
        throw httpError(502, `模型返回的不是有效 JSON，请重试。原始回复开头：${String(text).slice(0, 200)}`)
      }
      sendJson(res, { ok: true, kind, data, model: await textModel() })
    },

    'GET /settings': async (req, res) => sendJson(res, { ok: true, ...await settingsView() }),
    'POST /settings': async (req, res) => {
      await saveSettings(await readJsonBody(req))
      sendJson(res, { ok: true, ...await settingsView() })
    },
    'POST /settings/test': async (req, res) => {
      const body = await readJsonBody(req)
      const settings = await getSettings()
      const controller = new AbortController()
      res.on('close', () => { if (!res.writableEnded) controller.abort() })
      const started = Date.now()
      if (body.capability === 'text') {
        const reply = await runText('你是一个连通性测试助手。', '请只回复两个字：收到', controller.signal)
        sendJson(res, { ok: true, ms: Date.now() - started, text: String(reply).trim().slice(0, 60), model: await textModel() })
        return
      }
      if (body.capability === 'image') {
        const image = await generateImage({
          settings, signal: controller.signal, width: 720, height: 1280, refs: [],
          prompt: '竖屏9:16，电影质感，清晨的地铁站台，一束暖光照在空长椅上，浅景深',
        })
        const asset = await media.save('_test', image.buffer, { kind: 'image', source: 'ai', provider: image.provider, model: image.model, prompt: '连通性测试' })
        sendJson(res, { ok: true, ms: Date.now() - started, asset, provider: image.provider, model: image.model })
        return
      }
      if (body.capability === 'tts') {
        const text = String(body.text || '你好，这是映序的配音试听。').slice(0, 80)
        const audio = settings.tts.vendor === 'system'
          ? await studio.speakLocal({ text, voice: body.voice || settings.tts.voice, rate: body.rate || settings.tts.rate, signal: controller.signal })
          : await synthesizeSpeech({ settings, text, voice: body.voice, signal: controller.signal })
        const asset = await media.save('_test', audio.buffer, { kind: 'audio', source: 'ai', mime: audio.mime, prompt: text })
        sendJson(res, { ok: true, ms: Date.now() - started, asset })
        return
      }
      throw httpError(400, '不支持的测试项')
    },

    'GET /jobs': async (req, res) => sendJson(res, { ok: true, jobs: jobs.list(), now: Date.now() }),
    'POST /jobs': async (req, res) => {
      const body = await readJsonBody(req)
      const pid = safeSegment(body?.pid)
      if (!pid) throw httpError(400, '缺少项目 ID')
      const list = Array.isArray(body.jobs) ? body.jobs : [body]
      if (list.length > 200) throw httpError(400, '一次最多提交 200 个任务')
      const created = list.map((item) => jobs.create({
        type: String(item.type || ''), pid, target: item.target || null, label: String(item.label || '').slice(0, 80),
        payload: { ...(item.payload || {}), pid, target: item.target || null },
      }))
      sendJson(res, { ok: true, jobs: created })
    },
    'POST /jobs/cancel': async (req, res) => {
      const body = await readJsonBody(req)
      jobs.cancel(Array.isArray(body.ids) ? body.ids.map(String) : [])
      sendJson(res, { ok: true, jobs: jobs.list() })
    },
    'POST /jobs/ack': async (req, res) => {
      const body = await readJsonBody(req)
      jobs.ack(Array.isArray(body.ids) ? body.ids.map(String) : [])
      sendJson(res, { ok: true })
    },

    'GET /assets': async (req, res, url) => {
      const pids = String(url.searchParams.get('pids') || '').split(',').filter(Boolean).slice(0, 50)
      sendJson(res, { ok: true, assets: await media.list(pids) })
    },
    'POST /media/upload': async (req, res, url) => {
      const pid = safeSegment(url.searchParams.get('pid'))
      if (!pid) throw httpError(400, '缺少项目 ID')
      const buffer = await readBody(req, 300 * 1024 * 1024)
      let target = null
      try { target = JSON.parse(url.searchParams.get('target') || 'null') } catch { /* 没有归属也可以 */ }
      const asset = await media.save(pid, buffer, {
        source: url.searchParams.get('source') === 'sketch' ? 'sketch' : 'upload',
        prompt: String(url.searchParams.get('name') || '').slice(0, 200), target,
      })
      if (asset.kind !== 'image') {
        const info = await studio.probe(media.resolve(asset))
        asset.dur = info.duration || null
        if (info.width) { asset.w = info.width; asset.h = info.height }
      }
      sendJson(res, { ok: true, asset })
    },
    'POST /media/delete': async (req, res) => {
      const body = await readJsonBody(req)
      await media.remove({ pid: body.pid, file: body.file })
      sendJson(res, { ok: true })
    },
  }

  async function handle(req, res) {
    const started = Date.now()
    const url = new URL(req.url, 'http://local')
    const route = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) || '/' : url.pathname
    const quiet = route === '/jobs' || route.startsWith('/media/')
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') assertSameOrigin(req)
      const mediaMatch = /^\/media\/([^/]+)\/([^/]+)$/.exec(route)
      if (mediaMatch && (req.method === 'GET' || req.method === 'HEAD')) {
        await media.serve(req, res, decodeURIComponent(mediaMatch[1]), decodeURIComponent(mediaMatch[2]))
        return
      }
      const handler = routes[`${req.method === 'HEAD' ? 'GET' : req.method} ${route}`]
      if (!handler) throw httpError(404, `没有这个接口：${req.method} ${route}`)
      await handler(req, res, url)
    } catch (error) {
      const status = Number(error?.status) || 500
      if (!res.headersSent) sendJson(res, { ok: false, error: error?.message || String(error) }, status)
      else res.end()
      if (status >= 500) log(`${req.method} ${route} → ${error?.message || error}`)
      logLine(`${req.method} ${route} FAIL ${status} ${String(error?.message || error).slice(0, 300)}`)
      return
    }
    if (!quiet) logLine(`${req.method} ${route} ${res.statusCode} ${Date.now() - started}ms`)
  }
  //#endregion

  return {
    handle,
    dispose() { jobs.stop() },
    boot() {
      studio.cleanWork().catch(() => {})
      logLine(`boot: ${PREFIX} 数据目录=${root}`)
    },
    stateFile,
  }
}
