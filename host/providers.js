/**
 * 云端生成引擎的适配层：出图、图生视频、配音、文本。
 * 一律用原生 fetch，不依赖任何 SDK。接口参数按各家官方文档（2026-11 核对）填写；
 * 每家的 Key 只存一份，出图 / 视频 / 配音共用。
 */
import crypto from 'node:crypto'
import { sleep, sniffMime } from './util.js'

//#region 引擎目录（页面据此渲染「生成引擎」）
export const CATALOG = {
  keys: [
    { id: 'ark', name: '火山方舟', hint: '即梦同款的 Seedream 出图与 Seedance 视频', url: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey' },
    { id: 'zhipu', name: '智谱 BigModel', hint: 'CogView 出图、CogVideoX 视频', url: 'https://bigmodel.cn/usercenter/proj-mgmt/apikeys' },
    { id: 'siliconflow', name: '硅基流动', hint: 'Kolors 出图（免费）、Wan 视频、CosyVoice 配音', url: 'https://cloud.siliconflow.cn/account/ak' },
    { id: 'kling', name: '可灵', hint: '可灵图生视频。新版填 API Key；旧版模型填 Access Key', url: 'https://app.klingai.com/cn/dev/api-key' },
    { id: 'klingSecret', name: '可灵 Secret Key', hint: '只有 kling-v 开头的旧版模型需要', url: '' },
    { id: 'deepseek', name: 'DeepSeek', hint: '独立运行时的文本模型', url: 'https://platform.deepseek.com/api_keys' },
    { id: 'pollinations', name: 'Pollinations', hint: '海外服务，选填', url: 'https://enter.pollinations.ai' },
    { id: 'custom', name: '自定义接口', hint: 'OpenAI 兼容的出图 / 文本 / 配音接口', url: '' },
  ],
  text: [
    { id: 'deepseek', name: 'DeepSeek', key: 'deepseek', baseUrl: 'https://api.deepseek.com', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'zhipu', name: '智谱 GLM', key: 'zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-flash', 'glm-4-plus'] },
    { id: 'siliconflow', name: '硅基流动', key: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen3-32B'] },
    { id: 'custom', name: '自定义（OpenAI 兼容）', key: 'custom', baseUrl: '', models: [], custom: true },
  ],
  image: [
    { id: 'none', name: '暂不接入', note: '先用本地分镜草图占位，随时可以换成 AI 出图。', models: [] },
    {
      id: 'ark', name: '火山方舟 Seedream', key: 'ark', refs: true,
      note: '即梦同款模型。支持把角色定妆照作为参考图传入，同一角色跨镜头更稳定。',
      models: ['doubao-seedream-5-5-261028', 'doubao-seedream-5-0-pro-260628', 'doubao-seedream-5-0-flash-260915', 'doubao-seedream-4-5-251128', 'doubao-seedream-4-0-250828'],
    },
    {
      id: 'zhipu', name: '智谱 CogView', key: 'zhipu', refs: false,
      note: '国内直连，按张计费；不支持参考图，角色一致性靠固定外貌文字。',
      models: ['cogview-4-250304', 'glm-image', 'cogview-3-flash'],
    },
    {
      id: 'siliconflow', name: '硅基流动', key: 'siliconflow', refs: false,
      note: 'Kolors 模型可免费使用，适合先跑通流程。',
      models: ['Kwai-Kolors/Kolors', 'Qwen/Qwen-Image', 'Tongyi-MAI/Z-Image-Turbo'],
    },
    {
      id: 'pollinations', name: 'Pollinations（海外，免 Key 试用）', key: 'pollinations', keyOptional: true, refs: false,
      note: '提示词会发送到海外的 Pollinations 服务。免 Key 通道不保证可用、分辨率较低，仅适合试用。',
      models: ['flux'],
    },
    {
      id: 'custom', name: '自定义（OpenAI 兼容）', key: 'custom', custom: true, refs: false,
      note: '任何兼容 POST /images/generations 的服务。',
      models: [],
    },
  ],
  video: [
    { id: 'local', name: '本地运镜动效', note: '按每个镜头的运镜方式给关键帧加推、拉、摇、移动效，免费、几秒完成。', models: [] },
    {
      id: 'ark', name: '火山方舟 Seedance', key: 'ark',
      note: '即梦同款的图生视频，以关键帧为首帧，时长跟随镜头（2~12 秒）。按秒计费；2.0 / 2.5 系列需要账户余额高于 200 元或资源包。',
      models: ['doubao-seedance-1-0-pro-fast-251015', 'doubao-seedance-1-0-pro-250528', 'doubao-seedance-2-0-fast-260128', 'doubao-seedance-2-5-flash-261115'],
    },
    { id: 'zhipu', name: '智谱 CogVideoX', key: 'zhipu', note: 'cogvideox-flash 可免费使用；首帧图片不能超过 5 MB（会自动压缩）。', models: ['cogvideox-flash', 'cogvideox-3', 'cogvideox-2'] },
    { id: 'siliconflow', name: '硅基流动', key: 'siliconflow', note: '以关键帧为首帧，时长 5~15 秒。', models: ['MiniMaxAI/MiniMax-H3'] },
    {
      id: 'kling', name: '可灵 Kling', key: 'kling',
      note: 'kling-3.0 / 4.0 直接用 API Key；kling-v 开头的旧版模型还需要填写 Secret Key。',
      models: ['kling-3.0', 'kling-4.0', 'kling-v2-6'],
    },
  ],
  tts: [
    { id: 'system', name: '系统语音（本机）', note: 'macOS 自带语音，离线、免费。可在「系统设置 → 辅助功能 → 朗读内容」下载更自然的高品质语音。', models: [] },
    {
      id: 'siliconflow', name: '硅基流动 CosyVoice', key: 'siliconflow', note: '更自然的云端配音，按字数计费。',
      models: ['FunAudioLLM/CosyVoice2-0.5B'],
      voices: ['alex', 'benjamin', 'charles', 'david', 'anna', 'bella', 'claire', 'diana'],
    },
    { id: 'custom', name: '自定义（OpenAI 兼容）', key: 'custom', custom: true, note: '任何兼容 POST /audio/speech 的服务。', models: [], voices: [] },
  ],
}
//#endregion

//#region 通用请求
const userError = (message) => Object.assign(new Error(message), { status: 400 })

function requireKey(settings, name, label) {
  const key = settings.keys?.[name]
  if (!key) throw userError(`还没有填写 ${label} 的 API Key。请到「生成引擎」里填写。`)
  return key
}

/** 各家的报错格式都不一样，尽量抠出人能看懂的那句。 */
function describeFailure(status, text) {
  let detail = String(text || '').trim()
  try {
    const data = JSON.parse(detail)
    detail = data?.error?.message || data?.message || data?.msg || data?.error?.code || (typeof data?.error === 'string' ? data.error : '') || (typeof data === 'string' ? data : detail)
  } catch { /* 不是 JSON 就按原文 */ }
  detail = String(detail).slice(0, 300)
  if (status === 401 || status === 403) return `API Key 无效或没有权限（${status}）${detail ? `：${detail}` : ''}`
  if (status === 429) return `请求过于频繁或额度不足（429）${detail ? `：${detail}` : ''}`
  return `服务返回 ${status}${detail ? `：${detail}` : ''}`
}

async function callJson(url, { method = 'POST', key, body, signal, headers = {}, timeoutMs = 180_000 }) {
  const timeout = AbortSignal.timeout(timeoutMs)
  let response
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(key ? { authorization: `Bearer ${key}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (error) {
    if (signal?.aborted) throw Object.assign(new Error('已取消'), { canceled: true })
    throw new Error(timeout.aborted ? '请求超时，服务没有在限定时间内响应。' : `连不上服务（${error?.cause?.code || error?.message || error}）。请检查网络。`)
  }
  const text = await response.text()
  if (!response.ok) throw new Error(describeFailure(response.status, text))
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`服务返回了非 JSON 内容：${text.slice(0, 120)}`)
  }
}

/** 下载生成结果（结果链接通常 1~24 小时内失效，所以立刻落盘）。 */
async function download(url, { signal, limit = 400 * 1024 * 1024, headers } = {}) {
  let response
  try {
    response = await fetch(url, { signal, headers })
  } catch (error) {
    if (signal?.aborted) throw Object.assign(new Error('已取消'), { canceled: true })
    throw new Error(`下载生成结果失败（${error?.cause?.code || error?.message || error}）`)
  }
  if (!response.ok) throw new Error(describeFailure(response.status, await response.text().catch(() => '')))
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > limit) throw new Error('生成结果过大，已放弃保存。')
  return buffer
}

const dataUri = (ref) => `data:${(ref.mime || 'image/png').toLowerCase()};base64,${ref.buffer.toString('base64')}`

async function imageFromResult(data, signal) {
  const item = data?.data?.[0] || data?.images?.[0] || null
  if (item?.b64_json) return Buffer.from(item.b64_json, 'base64')
  if (item?.url) return download(item.url, { signal, limit: 60 * 1024 * 1024 })
  throw new Error(`服务没有返回图片${data?.error?.message ? `：${data.error.message}` : ''}`)
}
//#endregion

//#region 出图
/** Seedream 各代对像素总量的要求不同：5.0 lite / 4.5 最小要 1440x2560。 */
function arkPortraitSize(model) {
  if (/seedream-(4-5|5-0-lite|5-0-26)/.test(model)) return '1440x2560'
  return '1152x2048'
}

function zhipuPortraitSize(model) {
  return model.startsWith('glm-image') ? '960x1728' : '768x1344'
}

function siliconflowPortraitSize(model) {
  return model.startsWith('Qwen/Qwen-Image') ? '928x1664' : '720x1280'
}

/**
 * @returns {{ buffer: Buffer, provider: string, model: string, usedRefs: number }}
 */
export async function generateImage({ settings, prompt, negative, width, height, refs = [], signal }) {
  const config = settings.image || {}
  const vendor = CATALOG.image.find((item) => item.id === config.vendor)
  if (!vendor || vendor.id === 'none') throw userError('还没有接入出图引擎。请到「生成引擎」里选择一个，或先用本地分镜草图。')
  const text = String(prompt || '').trim()
  if (!text) throw userError('提示词是空的，先写画面描述或生图提示词。')
  const model = config.model || vendor.models[0] || ''
  let buffer
  let usedRefs = 0

  if (vendor.id === 'ark') {
    const body = { model, prompt: text, size: arkPortraitSize(model), response_format: 'url', watermark: false }
    if (refs.length) {
      body.image = refs.map(dataUri)
      usedRefs = refs.length
    }
    const data = await callJson('https://ark.cn-beijing.volces.com/api/v3/images/generations', { key: requireKey(settings, 'ark', '火山方舟'), body, signal })
    buffer = await imageFromResult(data, signal)
  } else if (vendor.id === 'zhipu') {
    const data = await callJson('https://open.bigmodel.cn/api/paas/v4/images/generations', {
      key: requireKey(settings, 'zhipu', '智谱'), signal,
      body: { model, prompt: text, size: zhipuPortraitSize(model), watermark_enabled: false },
    })
    buffer = await imageFromResult(data, signal)
  } else if (vendor.id === 'siliconflow') {
    const body = { model, prompt: text, image_size: siliconflowPortraitSize(model) }
    if (negative) body.negative_prompt = negative
    if (model.includes('Kolors')) Object.assign(body, { num_inference_steps: 25, guidance_scale: 7.5 })
    const data = await callJson('https://api.siliconflow.cn/v1/images/generations', {
      key: requireKey(settings, 'siliconflow', '硅基流动'), body, signal, headers: { 'X-Enable-Watermark': '0' },
    })
    buffer = await imageFromResult(data, signal)
  } else if (vendor.id === 'pollinations') {
    const key = settings.keys?.pollinations
    const seed = crypto.randomInt(1, 2 ** 31)
    const short = encodeURIComponent(text.slice(0, 1200))
    const url = key
      ? `https://gen.pollinations.ai/image/${short}?width=${width}&height=${height}&seed=${seed}${config.model ? `&model=${encodeURIComponent(config.model)}` : ''}`
      : `https://image.pollinations.ai/prompt/${short}?width=${width}&height=${height}&seed=${seed}&nologo=true`
    buffer = await download(url, { signal, limit: 60 * 1024 * 1024, headers: key ? { authorization: `Bearer ${key}` } : undefined })
  } else {
    const base = String(config.baseUrl || '').replace(/\/+$/, '')
    if (!/^https?:\/\//.test(base)) throw userError('自定义出图接口需要填写以 http(s):// 开头的 Base URL。')
    if (!model) throw userError('自定义出图接口需要填写模型名称。')
    const data = await callJson(`${base}/images/generations`, {
      key: settings.keys?.custom, signal, body: { model, prompt: text, size: `${width}x${height}`, n: 1 },
    })
    buffer = await imageFromResult(data, signal)
  }

  if (!sniffMime(buffer)?.startsWith('image/')) throw new Error('服务返回的内容不是图片。')
  return { buffer, provider: vendor.name, model, usedRefs }
}
//#endregion

//#region 图生视频
/** 可灵旧版接口用 AccessKey + SecretKey 现签一个 30 分钟有效的 JWT。 */
function klingToken(accessKey, secretKey) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const head = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: accessKey, exp: now + 1800, nbf: now - 5 })}`
  return `${head}.${crypto.createHmac('sha256', secretKey).update(head).digest('base64url')}`
}

/** 轮询异步任务直到拿到视频地址。 */
async function pollVideo({ check, signal, update, timeoutMs = 25 * 60_000, intervalMs = 5000 }) {
  const started = Date.now()
  for (;;) {
    await sleep(intervalMs, signal)
    const state = await check()
    if (state.url) return state.url
    if (state.failed) throw new Error(`图生视频失败：${state.failed}`)
    const elapsed = Date.now() - started
    if (elapsed > timeoutMs) throw new Error('图生视频超过 25 分钟仍未完成，已停止等待。')
    // 进度只能估：多数任务 1~4 分钟完成。
    update?.(Math.min(0.9, 0.1 + 0.8 * (elapsed / 180_000)), `云端生成中，已等待 ${Math.round(elapsed / 1000)} 秒`)
  }
}

const clampSeconds = (value, min, max) => Math.max(min, Math.min(max, Math.round(Number(value) || 5)))

/**
 * 以关键帧为首帧生成一段视频。
 * @returns {{ buffer: Buffer, provider: string, model: string }}
 */
export async function generateVideo({ settings, prompt, image, duration, signal, update }) {
  const config = settings.video || {}
  const vendor = CATALOG.video.find((item) => item.id === config.vendor)
  if (!vendor || vendor.id === 'local') throw userError('当前选择的是「本地运镜动效」，合成时会自动加动效，不需要单独生成视频。')
  const model = config.model || vendor.models[0]
  const text = String(prompt || '').trim() || '镜头缓慢推进，人物自然地呼吸与眨眼'
  let url

  if (vendor.id === 'ark') {
    const key = requireKey(settings, 'ark', '火山方舟')
    const base = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks'
    const legacy = /seedance-1-0/.test(model)
    const body = {
      model,
      content: [
        { type: 'text', text },
        { type: 'image_url', image_url: { url: dataUri(image) }, role: 'first_frame' },
      ],
      // adaptive：画幅跟随首帧（关键帧本身就是 9:16）。
      ratio: 'adaptive',
      duration: clampSeconds(duration, legacy ? 2 : 4, 12),
      resolution: '720p',
      watermark: false,
    }
    // 2.0 / 2.5 默认会顺带生成声音；配音由本工作台统一处理，这里关掉。
    if (!legacy) body.generate_audio = false
    const created = await callJson(base, { key, signal, body })
    if (!created?.id) throw new Error('火山方舟没有返回任务 ID。')
    url = await pollVideo({
      signal, update,
      check: async () => {
        const task = await callJson(`${base}/${created.id}`, { method: 'GET', key, signal })
        if (task.status === 'succeeded') return { url: task.content?.video_url }
        if (['failed', 'cancelled', 'expired'].includes(task.status)) return { failed: task.error?.message || task.status }
        return {}
      },
    })
  } else if (vendor.id === 'zhipu') {
    const key = requireKey(settings, 'zhipu', '智谱')
    const body = { model, prompt: text, image_url: dataUri(image), size: '1080x1920', fps: 30 }
    if (model === 'cogvideox-3') body.duration = Number(duration) > 7 ? 10 : 5
    const created = await callJson('https://open.bigmodel.cn/api/paas/v4/videos/generations', { key, signal, body })
    if (!created?.id) throw new Error('智谱没有返回任务 ID。')
    url = await pollVideo({
      signal, update,
      check: async () => {
        const task = await callJson(`https://open.bigmodel.cn/api/paas/v4/async-result/${created.id}`, { method: 'GET', key, signal })
        if (task.task_status === 'SUCCESS') return { url: task.video_result?.[0]?.url }
        if (task.task_status === 'FAIL') return { failed: task.error?.message || '任务失败' }
        return {}
      },
    })
  } else if (vendor.id === 'siliconflow') {
    const key = requireKey(settings, 'siliconflow', '硅基流动')
    const created = await callJson('https://api.siliconflow.cn/v1/video/submit', {
      key, signal,
      body: {
        model, prompt: text, duration: clampSeconds(duration, 5, 15), resolution: '768p', ratio: '9:16',
        images: [{ url: dataUri(image), role: 'first_frame' }],
      },
    })
    if (!created?.requestId) throw new Error('硅基流动没有返回任务 ID。')
    url = await pollVideo({
      signal, update,
      check: async () => {
        const task = await callJson('https://api.siliconflow.cn/v1/video/status', { key, signal, body: { requestId: created.requestId } })
        if (task.status === 'Succeed') return { url: task.results?.videos?.[0]?.url }
        if (task.status === 'Failed') return { failed: task.reason || '任务失败' }
        return {}
      },
    })
  } else if (vendor.id === 'kling') {
    const host = 'https://api-beijing.klingai.com'
    const key = requireKey(settings, 'kling', '可灵')
    if (/^kling-v/.test(model)) {
      // 旧版接口：AccessKey + SecretKey 签 JWT，图片传不带前缀的 base64。
      const secret = requireKey(settings, 'klingSecret', '可灵 Secret Key（旧版模型需要）')
      const created = await callJson(`${host}/v1/videos/image2video`, {
        key: klingToken(key, secret), signal,
        body: { model_name: model, image: image.buffer.toString('base64'), prompt: text.slice(0, 2400), duration: String(clampSeconds(duration, 3, 15)), mode: 'std' },
      })
      const taskId = created?.data?.task_id
      if (!taskId) throw new Error(`可灵没有返回任务 ID${created?.message ? `：${created.message}` : ''}`)
      url = await pollVideo({
        signal, update,
        check: async () => {
          const task = await callJson(`${host}/v1/videos/image2video/${taskId}`, { method: 'GET', key: klingToken(key, secret), signal })
          if (task?.data?.task_status === 'succeed') return { url: task.data.task_result?.videos?.[0]?.url }
          if (task?.data?.task_status === 'failed') return { failed: task.data.task_status_msg || '任务失败' }
          return {}
        },
      })
    } else {
      // 新版接口：直接用 API Key。
      const created = await callJson(`${host}/image-to-video/${encodeURIComponent(model)}`, {
        key, signal,
        body: {
          contents: [{ type: 'prompt', text: text.slice(0, 2400) }, { type: 'first_frame', url: image.buffer.toString('base64') }],
          settings: { resolution: '720p', duration: clampSeconds(duration, 3, 15), audio: 'off', multi_shot: false },
        },
      })
      const taskId = created?.data?.id
      if (!taskId) throw new Error(`可灵没有返回任务 ID${created?.message ? `：${created.message}` : ''}`)
      url = await pollVideo({
        signal, update,
        check: async () => {
          const result = await callJson(`${host}/tasks?task_ids=${encodeURIComponent(taskId)}`, { method: 'GET', key, signal })
          const task = Array.isArray(result?.data) ? result.data[0] : null
          if (task?.status === 'succeeded') return { url: (task.outputs || []).find((item) => item.type === 'video')?.url }
          if (task?.status === 'failed') return { failed: task.message || '任务失败' }
          return {}
        },
      })
    }
  }

  if (!url) throw new Error('任务完成了，但服务没有返回视频地址。')
  update?.(0.92, '下载视频')
  const buffer = await download(url, { signal })
  if (!sniffMime(buffer)?.startsWith('video/')) throw new Error('服务返回的内容不是视频。')
  return { buffer, provider: vendor.name, model }
}
//#endregion

//#region 配音与文本
/** 云端配音（OpenAI 兼容的 /audio/speech）。 */
export async function synthesizeSpeech({ settings, text, voice, signal }) {
  const config = settings.tts || {}
  const vendor = CATALOG.tts.find((item) => item.id === config.vendor)
  if (!vendor || vendor.id === 'system') throw userError('当前配音引擎是系统语音。')
  const custom = vendor.id === 'custom'
  const base = custom ? String(config.baseUrl || '').replace(/\/+$/, '') : 'https://api.siliconflow.cn/v1'
  if (!/^https?:\/\//.test(base)) throw userError('自定义配音接口需要填写以 http(s):// 开头的 Base URL。')
  const model = config.model || vendor.models[0]
  if (!model) throw userError('请填写配音模型名称。')
  const key = custom ? settings.keys?.custom : requireKey(settings, 'siliconflow', '硅基流动')
  let chosen = voice || config.voice || vendor.voices?.[0] || 'alloy'
  // 硅基流动的内置音色要写成「模型名:音色名」。
  if (!custom && !chosen.includes(':')) chosen = `${model}:${chosen}`
  const timeout = AbortSignal.timeout(120_000)
  let response
  try {
    response = await fetch(`${base}/audio/speech`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ model, input: text, voice: chosen, response_format: 'mp3', speed: Math.max(0.5, Math.min(2, Number(config.speed) || 1)) }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })
  } catch (error) {
    if (signal?.aborted) throw Object.assign(new Error('已取消'), { canceled: true })
    throw new Error(`连不上配音服务（${error?.cause?.code || error?.message || error}）`)
  }
  if (!response.ok) throw new Error(describeFailure(response.status, await response.text().catch(() => '')))
  const buffer = Buffer.from(await response.arrayBuffer())
  if (!sniffMime(buffer)?.startsWith('audio/')) throw new Error('配音服务返回的内容不是音频。')
  return { buffer, mime: sniffMime(buffer), provider: vendor.name, model: chosen }
}

/** 独立运行时的文本生成（OpenAI 兼容的 /chat/completions）。 */
export async function completeText({ settings, system, user, signal }) {
  const config = settings.text || {}
  const vendor = CATALOG.text.find((item) => item.id === config.vendor) || CATALOG.text[0]
  const base = String(vendor.custom ? config.baseUrl : vendor.baseUrl).replace(/\/+$/, '')
  if (!/^https?:\/\//.test(base)) throw userError('自定义文本接口需要填写以 http(s):// 开头的 Base URL。')
  const model = config.model || vendor.models[0]
  if (!model) throw userError('请填写文本模型名称。')
  const data = await callJson(`${base}/chat/completions`, {
    key: requireKey(settings, vendor.key, vendor.name), signal,
    body: { model, temperature: 0.85, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] },
  })
  const text = data?.choices?.[0]?.message?.content
  if (!text || !String(text).trim()) throw new Error('模型没有返回任何内容，请重试。')
  if (data.choices[0].finish_reason === 'length') throw new Error('模型输出被截断（达到单次输出上限）。可以把集数调小后重试。')
  return String(text)
}
//#endregion
