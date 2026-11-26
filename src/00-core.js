// 基础：React 别名、常量、数据形状、接口与纯函数。
const React = require('react')
const h = React.createElement
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext, Fragment } = React
const cx = (...parts) => parts.filter(Boolean).join(' ')

const API = '/drama-board/api'
const GENRES = ['逆袭', '甜宠', '悬疑', '重生', '萌宝', '其他']
const STYLES = ['写实', '国漫', '3D']
const SHOT_SIZES = ['远景', '全景', '中景', '近景', '特写']
const CAMERAS = ['固定', '推', '拉', '摇', '移', '跟', '升降']

/** 画风 → 写进每条生图提示词开头的风格描述。 */
const STYLE_PROMPTS = {
  写实: '电影感写实摄影，真实皮肤质感，自然光影，35mm 镜头，浅景深',
  国漫: '国漫风格，精致线条，赛璐璐上色，色彩饱满，光影细腻',
  '3D': '3D 动画电影风格，角色造型圆润，柔和全局光照，材质细腻',
}

/** 影调：全剧统一的色彩倾向。colors 用于本地草图和界面色卡。 */
const LOOKS = [
  { id: 'natural', name: '自然', prompt: '', colors: ['#2b3a4a', '#8fa3b5', '#e9dcc7'] },
  { id: 'cold', name: '冷调悬疑', prompt: '低饱和冷色调，青蓝色阴影，局部硬光，氛围压抑', colors: ['#0f1c2b', '#2f6d86', '#c9e3ea'] },
  { id: 'warm', name: '暖调治愈', prompt: '暖色调，柔和逆光，奶油色高光，氛围温柔', colors: ['#4a2c1f', '#d98b4d', '#fbe6c4'] },
  { id: 'neon', name: '霓虹都市', prompt: '夜景霓虹，洋红与青色对比光，湿润地面反光', colors: ['#150b2c', '#d6336c', '#35d6e0'] },
  { id: 'ink', name: '古风水墨', prompt: '古风，水墨晕染质感，留白构图，青绿设色', colors: ['#1f2a26', '#6f8f7b', '#efe8d6'] },
  { id: 'gold', name: '豪门鎏金', prompt: '高级感室内光，金色点光与深色木质，对比强烈', colors: ['#17120c', '#b8862f', '#f3deb0'] },
]

/**
 * 发布平台。四家的接口开放程度不一样，字段限制也不一样：
 * api = open 表示官方有发布接口可对接（都要开放平台入驻 + 用户授权），closed 表示只有网页后台。
 * studio 是手动发布入口，没接通接口时也能 30 秒发出去。
 */
const PLATFORMS = [
  {
    id: 'douyin', name: '抖音', short: '抖', color: '#fe2c55', api: 'open',
    titleMax: 55, captionMax: 1000, tagMax: 5, coverAspect: '9:16',
    titleHint: '不超过 55 字，信息流一般只露出前 20 字',
    apiDetail: '官方接口：上传视频 → 创建视频（video.create.bind）。需企业主体入驻开放平台，并在「能力实验室」开通「代替用户发布内容到抖音」，发布时还要账号本人授权。',
    limits: ['竖屏 9:16，推荐 1080×1920', '文件 ≤ 4GB，超过 300MB 必须分片', '标题 ≤ 55 字，描述 ≤ 1000 字', '话题 3–5 个'],
    doc: 'https://developer.open-douyin.com/docs/resource/zh-CN/dop/develop/openapi/video-management/douyin/create-video/video-create',
    studio: 'https://creator.douyin.com/creator-micro/content/upload', studioName: '抖音创作服务平台',
  },
  {
    id: 'bilibili', name: 'B站', short: 'B', color: '#00aeec', api: 'open',
    titleMax: 80, captionMax: 2000, tagMax: 10, coverAspect: '16:9',
    titleHint: '不超过 80 字，搜索结果里会完整显示',
    apiDetail: '官方接口：上传预处理 → 分片上传 → 合片 → 封面上传 → 稿件提交（还要先查分区）。需入驻开放平台、创建应用，走 OAuth 授权和 HMAC-SHA256 签名。',
    limits: ['竖屏能投，但站内主推 16:9', '文件 ≤ 4GB，时长 < 5 小时', '标题 ≤ 80 字，简介 ≤ 2000 字', '封面 16:9（1146×717）', '标签 ≤ 10 个'],
    doc: 'https://open.bilibili.com/doc/',
    studio: 'https://member.bilibili.com/platform/upload/video/frame', studioName: 'B站创作中心',
  },
  {
    id: 'kuaishou', name: '快手', short: '快', color: '#ff5000', api: 'open',
    titleMax: 50, captionMax: 500, tagMax: 5, coverAspect: '9:16',
    titleHint: '不超过 50 字；快手没有独立标题，第一行就是标题',
    apiDetail: '官方接口：start_upload → 上传 → publish（scope user_video_publish）。需企业资质入驻开放平台，并单独申请视频发布权限。',
    limits: ['竖屏 9:16', '直传 ≤ 10MB，更大的走分片（每片 ≤ 10MB）', '描述 ≤ 500 字，首行当标题', '封面 ≤ 10MB'],
    doc: 'https://open.kuaishou.com/platformDocs/openAbility/contentManagement/createAVideo.html',
    studio: 'https://cp.kuaishou.com/article/publish/video', studioName: '快手创作者服务平台',
  },
  {
    id: 'shipinhao', name: '视频号', short: '视', color: '#07c160', api: 'closed',
    titleMax: 16, captionMax: 1000, tagMax: 10, coverAspect: '9:16',
    titleHint: '不超过 16 字，只收中英文、数字和空格',
    apiDetail: '没有对外的发布接口（官方社区答复「目前没有」）。视频号助手给的 AppID/AppSecret 只开放了直播数据、橱窗商品等能力，发视频只能登录网页版助手手动上传。',
    limits: ['竖屏 9:16', '短标题 ≤ 16 字，别带标点和表情', '描述 ≤ 1000 字，可以带 #话题', '网页版视频号助手手动上传'],
    doc: 'https://developers.weixin.qq.com/doc/channels/api/',
    studio: 'https://channels.weixin.qq.com/platform/post/create', studioName: '视频号助手',
  },
]
const platformOf = (id) => PLATFORMS.find((item) => item.id === id) || PLATFORMS[0]

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

//#region 数据形状
const emptyShot = () => ({
  id: uid('s'), shotSize: '中景', camera: '固定', description: '', cast: [], castSet: false,
  dialogue: '（无）', duration: 3, imagePrompt: '', videoPrompt: '',
  image: null, images: [], video: null, audio: null, audioText: '',
})

const blankPublish = () => ({ platform: 'douyin', titles: [], caption: '', tags: [], coverText: '', pick: 0 })

const blankEpisode = (index) => ({
  id: uid('e'), index, title: `第${index}集`, hook: '', conflict: '', cliffhanger: '',
  publish: blankPublish(), cover: null, renders: [], bgm: null,
})

function makeProject(name) {
  return {
    id: uid('p'),
    name: name || '新短剧项目',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    brief: { logline: '', genre: '逆袭', episodes: 10, style: '写实' },
    visual: { look: 'natural', extra: '', negative: '' },
    narratorVoice: '',
    characters: [],
    episodes: [],
    boards: {},
    checklist: {},
  }
}

/** 素材引用：只认后端返回的那几个字段，文件名必须是安全字符。 */
function normalizeRef(raw) {
  if (!raw || typeof raw !== 'object') return null
  const ok = (value) => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(value)
  if (!ok(raw.pid) || !ok(raw.file)) return null
  return {
    id: String(raw.id || raw.file), pid: raw.pid, file: raw.file,
    kind: ['image', 'video', 'audio', 'render'].includes(raw.kind) ? raw.kind : 'image',
    mime: typeof raw.mime === 'string' ? raw.mime : '',
    w: Number(raw.w) || null, h: Number(raw.h) || null, dur: Number(raw.dur) || null,
    source: typeof raw.source === 'string' ? raw.source : 'ai',
    provider: typeof raw.provider === 'string' ? raw.provider : '',
    createdAt: Number(raw.createdAt) || Date.now(),
  }
}
const normalizeRefs = (list) => (Array.isArray(list) ? list.map(normalizeRef).filter(Boolean).slice(0, 12) : [])

function normalizeShot(shot) {
  return {
    id: typeof shot?.id === 'string' ? shot.id : uid('s'),
    shotSize: SHOT_SIZES.includes(shot?.shotSize) ? shot.shotSize : '中景',
    camera: CAMERAS.includes(shot?.camera) ? shot.camera : '固定',
    description: String(shot?.description ?? ''),
    cast: Array.isArray(shot?.cast) ? shot.cast.map((name) => String(name || '').trim()).filter(Boolean).slice(0, 6) : [],
    // castSet：出镜角色是明确指定的（AI 给出或手动勾选）；否则按姓名在文字里自动匹配。
    castSet: Boolean(shot?.castSet) || (Array.isArray(shot?.cast) && shot.cast.some((name) => String(name || '').trim())),
    dialogue: String(shot?.dialogue ?? ''),
    duration: Number.isFinite(Number(shot?.duration)) && Number(shot.duration) >= 0 ? Number(shot.duration) : 3,
    imagePrompt: String(shot?.imagePrompt ?? ''),
    videoPrompt: String(shot?.videoPrompt ?? ''),
    image: normalizeRef(shot?.image),
    images: normalizeRefs(shot?.images),
    video: normalizeRef(shot?.video),
    audio: normalizeRef(shot?.audio),
    audioText: String(shot?.audioText ?? ''),
  }
}

function normalizeProject(raw) {
  const base = makeProject()
  if (!raw || typeof raw !== 'object') return base
  const brief = raw.brief && typeof raw.brief === 'object' ? raw.brief : {}
  const visual = raw.visual && typeof raw.visual === 'object' ? raw.visual : {}
  const project = {
    ...base,
    id: typeof raw.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}$/.test(raw.id) ? raw.id : base.id,
    name: typeof raw.name === 'string' && raw.name ? raw.name : '未命名短剧',
    createdAt: Number(raw.createdAt) || base.createdAt,
    updatedAt: Number(raw.updatedAt) || base.updatedAt,
    brief: {
      logline: typeof brief.logline === 'string' ? brief.logline : '',
      genre: GENRES.includes(brief.genre) ? brief.genre : '逆袭',
      episodes: Math.max(1, Math.min(60, Math.round(Number(brief.episodes) || 10))),
      style: STYLES.includes(brief.style) ? brief.style : '写实',
    },
    visual: {
      look: LOOKS.some((look) => look.id === visual.look) ? visual.look : 'natural',
      extra: String(visual.extra ?? ''),
      negative: String(visual.negative ?? ''),
    },
    narratorVoice: String(raw.narratorVoice ?? ''),
    checklist: raw.checklist && typeof raw.checklist === 'object' ? { ...raw.checklist } : {},
    characters: Array.isArray(raw.characters) ? raw.characters.map((c) => ({
      id: typeof c?.id === 'string' ? c.id : uid('c'),
      name: String(c?.name ?? ''),
      identity: String(c?.identity ?? ''),
      personality: String(c?.personality ?? ''),
      appearance: String(c?.appearance ?? ''),
      portrait: normalizeRef(c?.portrait),
      portraits: normalizeRefs(c?.portraits),
      voice: String(c?.voice ?? ''),
    })) : [],
    episodes: Array.isArray(raw.episodes) ? raw.episodes.map((e, i) => {
      const publish = e?.publish && typeof e.publish === 'object' ? e.publish : {}
      return {
        id: typeof e?.id === 'string' ? e.id : uid('e'),
        index: i + 1,
        title: String(e?.title ?? `第${i + 1}集`),
        hook: String(e?.hook ?? ''),
        conflict: String(e?.conflict ?? ''),
        cliffhanger: String(e?.cliffhanger ?? ''),
        publish: {
          platform: PLATFORMS.some((item) => item.id === publish.platform) ? publish.platform : 'douyin',
          titles: Array.isArray(publish.titles) ? publish.titles.map(String).slice(0, 6) : [],
          caption: String(publish.caption ?? ''),
          tags: Array.isArray(publish.tags) ? publish.tags.map((tag) => String(tag).replace(/^#/, '')).filter(Boolean).slice(0, 8) : [],
          coverText: String(publish.coverText ?? ''),
          pick: Math.max(0, Number(publish.pick) || 0),
        },
        cover: typeof e?.cover === 'string' ? e.cover : null,
        renders: normalizeRefs(e?.renders),
        bgm: normalizeRef(e?.bgm),
      }
    }) : [],
    boards: {},
  }
  const boards = raw.boards && typeof raw.boards === 'object' ? raw.boards : {}
  for (const [key, list] of Object.entries(boards)) {
    if (!Array.isArray(list) || !/^[1-9][0-9]*$/.test(key) || Number(key) > Math.max(project.episodes.length, project.brief.episodes)) continue
    project.boards[key] = list.map(normalizeShot)
  }
  return project
}

function normalizeStore(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const projects = Array.isArray(source.projects) ? source.projects.map(normalizeProject) : []
  const activeId = projects.some((p) => p.id === source.activeId) ? source.activeId : (projects[0]?.id ?? null)
  return { projects, activeId }
}

/** 删除一集：同时删掉它的分镜，其余分镜随分集重新编号。 */
function removeEpisode(draft, id) {
  const nextBoards = {}
  draft.episodes = draft.episodes.filter((e) => e.id !== id).map((e, i) => {
    if (draft.boards[String(e.index)]) nextBoards[String(i + 1)] = draft.boards[String(e.index)]
    return { ...e, index: i + 1 }
  })
  draft.boards = nextBoards
  draft.brief.episodes = Math.max(1, draft.episodes.length)
}
//#endregion

//#region 接口
async function request(path, body) {
  const init = body === undefined
    ? { method: 'GET' }
    : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
  let response
  try {
    response = await fetch(`${API}/${path}`, init)
  } catch (error) {
    throw new Error(`连不上插件后端（${error?.message || error}）`)
  }
  let payload = null
  try {
    payload = await response.json()
  } catch {
    throw new Error(response.status === 404
      ? '后端还是旧版本：请重启 DeepSeek Harness 后再试。'
      : `后端返回了非 JSON 内容（HTTP ${response.status}）`)
  }
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `请求失败（HTTP ${response.status}）`)
  return payload
}

const mediaUrl = (ref) => (ref ? `${API}/media/${encodeURIComponent(ref.pid)}/${encodeURIComponent(ref.file)}` : '')

async function uploadMedia(pid, blob, { name = '', source = 'upload', target = null } = {}) {
  const query = new URLSearchParams({ pid, name, source, target: JSON.stringify(target) })
  let response
  try {
    response = await fetch(`${API}/media/upload?${query}`, { method: 'POST', headers: { 'content-type': 'application/octet-stream' }, body: blob })
  } catch (error) {
    throw new Error(`上传失败（${error?.message || error}）`)
  }
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || `上传失败（HTTP ${response.status}）`)
  return normalizeRef(payload.asset)
}
//#endregion

//#region 纯函数
function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

function downloadUrl(url, filename) {
  const anchor = document.createElement('a')
  anchor.href = `${url}?download=${encodeURIComponent(filename)}`
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

const safeName = (value) => String(value || '短剧项目').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60)
const totalDuration = (shots) => shots.reduce((sum, shot) => sum + (Number(shot.duration) || 0), 0)
const shotsOf = (project, index) => project?.boards?.[String(index)] || []
const pad2 = (value) => String(value).padStart(2, '0')
const clock = (seconds) => {
  const total = Math.max(0, Math.round(seconds))
  return `${Math.floor(total / 60)}:${pad2(total % 60)}`
}

/**
 * 把「林晚（低声）：你是谁？」拆成说话人与台词。
 * 没有台词（空、「（无）」）时返回 null。
 */
function parseDialogue(text) {
  const raw = String(text || '').trim()
  if (!raw || /^[（(]?\s*无\s*[)）]?$/.test(raw)) return null
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  let speaker = ''
  const spoken = []
  for (const line of lines) {
    const match = /^([^：:（(「“"]{1,10})(?:[（(][^）)]*[）)])?\s*[：:]\s*(.+)$/.exec(line)
    const body = (match ? match[2] : line).replace(/[（(][^）)]*[）)]/g, '').replace(/^[“"「『]+|[”"」』]+$/g, '').trim()
    if (match && !speaker) speaker = match[1].trim()
    if (body) spoken.push(body)
  }
  const line = spoken.join(' ')
  return line ? { speaker, line } : null
}

/** 与后端 splitSubtitle 相同的切分规则，用于试映时的字幕。 */
function splitSubtitle(text, maxChars = 12) {
  const clean = String(text || '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const parts = clean.split(/(?<=[。！？!?；;…，,、])/).map((part) => part.trim()).filter(Boolean)
  const cues = []
  let current = ''
  const flush = () => { if (current) { cues.push(current); current = '' } }
  for (const part of parts) {
    if ((current + part).length <= maxChars) { current += part; continue }
    flush()
    if (part.length <= maxChars) { current = part; continue }
    for (let i = 0; i < part.length; i += maxChars) {
      const slice = part.slice(i, i + maxChars)
      if (slice.length === maxChars || i + maxChars < part.length) cues.push(slice)
      else current = slice
    }
  }
  flush()
  return cues.map((cue) => cue.replace(/[，,、；;]+$/, '')).filter(Boolean)
}

const stripTail = (text) => String(text || '').trim().replace(/[。.；;，,\s]+$/, '')

/** 这个镜头里出现了哪些角色：优先用 cast 字段，没有就按姓名在文字里找。 */
function castOf(project, shot) {
  const named = project.characters.filter((c) => c.name.trim())
  if (shot.castSet) return named.filter((c) => shot.cast.includes(c.name.trim()))
  const haystack = `${shot.imagePrompt}\n${shot.description}`
  return named.filter((c) => haystack.includes(c.name.trim()))
}

/**
 * 拼出真正发给出图引擎的提示词：画风 + 影调 + 画面 + 出镜角色的固定外貌 + 画幅。
 * 外貌由这里逐字拼接，不依赖模型自己记得抄。
 */
function composeImagePrompt(project, shot) {
  const look = LOOKS.find((item) => item.id === project.visual.look)
  const scene = (shot.imagePrompt.trim() || shot.description.trim())
  const cast = castOf(project, shot)
  const sheets = cast
    .filter((c) => c.appearance.trim() && !scene.includes(stripTail(c.appearance)))
    .map((c) => `${c.name.trim()}：${stripTail(c.appearance)}`)
  const parts = [
    STYLE_PROMPTS[project.brief.style] || '',
    look?.prompt || '',
    `${shot.shotSize}镜头`,
    stripTail(scene),
    sheets.length ? `人物设定——${sheets.join('；')}` : '',
    stripTail(project.visual.extra),
    /9\s*[:：]\s*16/.test(scene) ? '' : '竖屏 9:16 构图',
  ].filter(Boolean)
  return {
    prompt: scene ? parts.join('，') : '',
    cast,
    refs: cast.map((c) => c.portrait).filter(Boolean).slice(0, 4),
  }
}

function composePortraitPrompt(project, character) {
  const look = LOOKS.find((item) => item.id === project.visual.look)
  return [
    STYLE_PROMPTS[project.brief.style] || '',
    look?.prompt || '',
    '角色定妆照，单人半身肖像，正面平视镜头，表情自然',
    stripTail(character.appearance),
    '干净的浅灰色背景，柔和棚拍光，竖屏 9:16 构图',
  ].filter(Boolean).join('，')
}

function csvCell(value) {
  const raw = String(value ?? '')
  const text = /^[=+@-]/.test(raw) ? `'${raw}` : raw
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
const mdCell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')

function toMarkdown(project, index, shots) {
  const lines = [`# ${project.name}`, '', `> ${project.brief.logline || '（未填写梗概）'}`, '',
    `- 题材：${project.brief.genre}　画风：${project.brief.style}　集数：${project.brief.episodes}　画幅：9:16`, '']
  if (project.characters.length > 0) {
    lines.push('## 角色卡', '', '| 姓名 | 身份 | 性格 | 固定外貌 |', '| --- | --- | --- | --- |')
    for (const c of project.characters) lines.push(`| ${mdCell(c.name)} | ${mdCell(c.identity)} | ${mdCell(c.personality)} | ${mdCell(c.appearance)} |`)
    lines.push('')
  }
  const episode = project.episodes.find((e) => e.index === index)
  lines.push(`## 第 ${index} 集 分镜表${episode?.title ? `：${episode.title}` : ''}`, '')
  if (episode) lines.push(`- 前 3 秒钩子：${episode.hook}`, `- 本集冲突：${episode.conflict}`, `- 结尾卡点：${episode.cliffhanger}`, '')
  lines.push('| 镜号 | 景别 | 运镜 | 画面描述 | 台词/旁白 | 时长(秒) | AI 生图提示词 | AI 视频提示词 |', '| --- | --- | --- | --- | --- | --- | --- | --- |')
  shots.forEach((shot, i) => {
    lines.push(`| ${i + 1} | ${shot.shotSize} | ${shot.camera} | ${mdCell(shot.description)} | ${mdCell(shot.dialogue)} | ${shot.duration} | ${mdCell(composeImagePrompt(project, shot).prompt)} | ${mdCell(shot.videoPrompt)} |`)
  })
  lines.push('', `合计 ${totalDuration(shots)} 秒。`)
  return lines.join('\n')
}

function toCsv(project, index, shots) {
  const rows = [['镜号', '景别', '运镜', '画面描述', '台词/旁白', '时长(秒)', 'AI 生图提示词', 'AI 视频提示词']]
  shots.forEach((shot, i) => {
    rows.push([i + 1, shot.shotSize, shot.camera, shot.description, shot.dialogue, shot.duration, composeImagePrompt(project, shot).prompt, shot.videoPrompt])
  })
  const episode = project.episodes.find((e) => e.index === index)
  const meta = [[`# ${project.name}`], [`# 题材：${project.brief.genre}　画风：${project.brief.style}　画幅：9:16`], [`# 第 ${index} 集${episode?.title ? `：${episode.title}` : ''}`], []]
  return '﻿' + [...meta, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
}

/** 一集的制作进度：有多少镜头已经有图、有配音、有成片。 */
function episodeProgress(project, index) {
  const shots = shotsOf(project, index)
  const spoken = shots.filter((shot) => parseDialogue(shot.dialogue))
  const episode = project.episodes.find((e) => e.index === index)
  return {
    shots: shots.length,
    images: shots.filter((shot) => shot.image).length,
    videos: shots.filter((shot) => shot.video).length,
    spoken: spoken.length,
    voiced: spoken.filter((shot) => shot.audio).length,
    stale: spoken.filter((shot) => shot.audio && shot.audioText && shot.audioText !== parseDialogue(shot.dialogue)?.line).length,
    seconds: totalDuration(shots),
    render: episode?.renders?.[0] || null,
  }
}

function projectChecks(project) {
  const checks = []
  if (!project.brief.logline.trim()) checks.push({ text: '补充一句话故事梗概', detail: '明确主角、目标与核心冲突。', tab: 'brief' })
  const missingLooks = project.characters.filter((c) => !c.appearance.trim()).length
  if (!project.characters.length) checks.push({ text: '建立主要角色', detail: '先固定外貌，再开始设计镜头。', tab: 'cast' })
  else if (missingLooks) checks.push({ text: `${missingLooks} 个角色缺少固定外貌`, detail: '为角色填写可重复使用的视觉描述。', tab: 'cast' })
  const noPortrait = project.characters.filter((c) => c.appearance.trim() && !c.portrait).length
  if (noPortrait) checks.push({ text: `${noPortrait} 个角色还没有定妆照`, detail: '定妆照会作为参考图，帮助同一角色在不同镜头里保持一致。', tab: 'cast' })
  const missingEpisodes = project.episodes.filter((e) => !e.hook.trim() || !e.conflict.trim() || !e.cliffhanger.trim()).length
  if (!project.episodes.length) checks.push({ text: '添加第一集故事', detail: '写好开场钩子、冲突和结尾卡点。', tab: 'episodes' })
  else if (missingEpisodes) checks.push({ text: `${missingEpisodes} 集故事尚未完整`, detail: '检查开场钩子、冲突与结尾卡点。', tab: 'episodes' })
  const boards = project.episodes.map((e) => [e.index, shotsOf(project, e.index)])
  const pending = boards.filter(([, shots]) => !shots.length).length
  if (pending) checks.push({ text: `${pending} 集等待镜头设计`, detail: '把分集故事拆成可以生成的镜头。', tab: 'board' })
  const all = boards.flatMap(([, shots]) => shots)
  const noDescription = all.filter((s) => !s.description.trim()).length
  if (noDescription) checks.push({ text: `${noDescription} 个镜头缺少画面描述`, detail: '补充场景、人物动作与画面重点。', tab: 'board' })
  const noImage = all.filter((s) => !s.image).length
  if (all.length && noImage) checks.push({ text: `${noImage} 个镜头还没有关键帧`, detail: '在分镜页批量出图，或逐个镜头生成。', tab: 'board' })
  const invalid = boards.filter(([, shots]) => shots.some((s) => !Number.isFinite(Number(s.duration)) || Number(s.duration) <= 0))
  if (invalid.length) checks.push({ text: `${invalid.length} 集存在无效镜头时长`, detail: '镜头时长应为大于 0 的秒数。', tab: 'board' })
  const over = boards.filter(([, shots]) => totalDuration(shots) > 120)
  if (over.length) checks.push({ text: `${over.length} 集总时长超过 120 秒`, detail: '按发布目标检查节奏与时长。', tab: 'board' })
  const unrendered = boards.filter(([index, shots]) => shots.length && shots.every((s) => s.image) && !episodeProgress(project, index).render).length
  if (unrendered) checks.push({ text: `${unrendered} 集可以合成成片了`, detail: '关键帧已齐，去成片页配音并合成。', tab: 'studio' })
  return checks
}
//#endregion
