/**
 * 文本生成的提示词：大纲、角色、分集、分镜、发布文案。
 * 模型一律只返回一个 JSON 对象，由 parseJsonReply 解析。
 */

/** 从模型回复里抠出 JSON（容忍 ```json 围栏与前后解释）。 */
export function parseJsonReply(text) {
  let value = String(text ?? '').trim()
  value = value.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const start = value.indexOf('{')
  const end = value.lastIndexOf('}')
  if (start >= 0 && end > start) value = value.slice(start, end + 1)
  return JSON.parse(value)
}

export const SYSTEM = [
  '你是抖音竖屏 AI 短剧的资深编剧兼分镜师，熟悉 9:16、1~2 分钟一集、前 3 秒必须抓住人的节奏。',
  '你的输出必须是一个 JSON 对象：不要 Markdown 代码块，不要任何解释或前后缀。',
  '所有文字用简体中文；字段名保持英文；不要输出 JSON 注释。',
].join('\n')

/** 把项目里角色卡的固定外貌拼成提示词素材。 */
function characterSheet(project) {
  const list = Array.isArray(project?.characters) ? project.characters : []
  if (list.length === 0) return '（本剧还没有角色卡，请先根据人设自行设定 2~4 个主要角色）'
  return list.map((c, i) => {
    const bits = [
      `姓名：${c?.name || `角色${i + 1}`}`,
      c?.identity ? `身份：${c.identity}` : '',
      c?.personality ? `性格：${c.personality}` : '',
      c?.appearance ? `固定外貌（生图必须原样引用）：${c.appearance}` : '',
    ].filter(Boolean)
    return bits.join('；')
  }).join('\n')
}

const styleLine = (brief) => `${brief.style || '写实'}${brief.styleNote ? `（${brief.styleNote}）` : ''}`

export const BUILDERS = {
  /** 立项 → 完整剧本大纲（角色卡 + 分集）。 */
  outline(project) {
    const brief = project?.brief || {}
    const count = Math.max(1, Math.min(60, Number(brief.episodes) || 10))
    return [
      `请为下面这部抖音 AI 短剧写一份完整的剧本大纲。`,
      ``,
      `【一句话梗概】${brief.logline || '（未填写，请你补一个有钩子的梗概）'}`,
      `【题材】${brief.genre || '逆袭'}`,
      `【画风】${styleLine(brief)}（画面由 AI 生成，人物要能稳定复现）`,
      `【集数】${count} 集，每集 60~120 秒`,
      ``,
      `要求：`,
      `1. 设计 2~4 个主要角色。appearance 是"固定外貌描述"，必须写清年龄、发型、服装、体型、标志性特征，`,
      `   用一句 40~80 字、可以直接粘进生图提示词的中文描述，全剧不许改动。`,
      `2. 每一集都要有：前 3 秒钩子（hook，一句能让人停下划走的话或画面）、本集冲突（conflict）、`,
      `   结尾卡点（cliffhanger，让观众非看下一集不可）。`,
      `3. 第 1 集必须在 3 秒内抛出冲突；整体节奏是"每集一个小反转，三集一个大反转"。`,
      `4. 集数严格等于 ${count} 集。`,
      ``,
      `严格按这个 JSON 结构输出：`,
      `{"characters":[{"name":"","identity":"","personality":"","appearance":""}],`,
      ` "episodes":[{"index":1,"title":"","hook":"","conflict":"","cliffhanger":""}]}`,
    ].join('\n')
  },

  /** 只重做角色卡。 */
  characters(project) {
    const brief = project?.brief || {}
    return [
      `请为下面这部抖音 AI 短剧设计角色卡。`,
      ``,
      `【一句话梗概】${brief.logline || '（未填写，请先补梗概再设计角色）'}`,
      `【题材】${brief.genre || '逆袭'}　【画风】${styleLine(brief)}`,
      ``,
      `要求：2~4 个主要角色；每个角色给出姓名、身份、性格，以及一句 40~80 字的固定外貌描述`,
      `（年龄、发型、服装、体型、标志性特征，要能直接粘进生图提示词，并且全剧不得变化）。`,
      ``,
      `严格按这个 JSON 结构输出：`,
      `{"characters":[{"name":"","identity":"","personality":"","appearance":""}]}`,
    ].join('\n')
  },

  /** 只重做分集表。 */
  episodes(project) {
    const brief = project?.brief || {}
    const count = Math.max(1, Math.min(60, Number(brief.episodes) || 10))
    return [
      `请为下面这部抖音 AI 短剧写分集大纲，共 ${count} 集。`,
      ``,
      `【一句话梗概】${brief.logline || '（未填写，请你补一个）'}`,
      `【题材】${brief.genre || '逆袭'}　【画风】${styleLine(brief)}`,
      `【主要角色】`,
      characterSheet(project),
      ``,
      `每集必须给出：前 3 秒钩子 hook、本集冲突 conflict、结尾卡点 cliffhanger（勾着人看下一集）。`,
      `第 1 集 3 秒内抛冲突；每集一个小反转，三集一个大反转。`,
      ``,
      `严格按这个 JSON 结构输出：`,
      `{"episodes":[{"index":1,"title":"","hook":"","conflict":"","cliffhanger":""}]}`,
    ].join('\n')
  },

  /** 某一集 → 分镜表。 */
  storyboard(project, episode, episodeIndex) {
    const brief = project?.brief || {}
    const ep = episode || {}
    const no = Number(episodeIndex) || 1
    const names = (project?.characters || []).map((c) => c?.name).filter(Boolean)
    return [
      `请为抖音竖屏 AI 短剧的第 ${no} 集写分镜表。`,
      ``,
      `【一句话梗概】${brief.logline || ''}`,
      `【题材】${brief.genre || '逆袭'}　【画风】${styleLine(brief)}　【画幅】9:16 竖屏`,
      `【本集标题】${ep.title || `第${no}集`}`,
      `【前 3 秒钩子】${ep.hook || ''}`,
      `【本集冲突】${ep.conflict || ''}`,
      `【结尾卡点】${ep.cliffhanger || ''}`,
      ``,
      `【角色卡】`,
      characterSheet(project),
      ``,
      `要求：`,
      `1. 8~14 个镜头，总时长 60~120 秒，单镜 2~8 秒。每个字段都必须填写，duration 必须是数字。`,
      `2. shotSize 只用：远景/全景/中景/近景/特写；camera 只用：固定/推/拉/摇/移/跟/升降。`,
      `3. description 写清"谁、在哪、做什么、什么情绪"，要能直接照着拍。`,
      `4. cast 是这个镜头里出现的角色姓名数组${names.length ? `，只能从 ${names.join('、')} 里选` : ''}；没有人物就给空数组。`,
      `5. imagePrompt 是中文生图提示词：写画面本身——景别、人物的动作与表情、场景环境、光线与色调。`,
      `   人物只写姓名，不要重复外貌描述（系统会按 cast 自动拼接角色卡里的固定外貌）。`,
      `6. videoPrompt 是中文视频提示词：写清镜头运动、人物动作节奏，不要重复外貌。`,
      `7. dialogue 写台词或旁白，格式为"角色名：台词"或"旁白：内容"，每句不超过 20 字；没有台词就写"（无）"。`,
      ``,
      `严格按这个 JSON 结构输出：`,
      `{"shots":[{"shotSize":"中景","camera":"固定","description":"","cast":[""],"dialogue":"","duration":3,`,
      ` "imagePrompt":"","videoPrompt":""}]}`,
    ].join('\n')
  },

  /** 某一集 → 抖音发布文案。 */
  publish(project, episode, episodeIndex) {
    const brief = project?.brief || {}
    const ep = episode || {}
    const no = Number(episodeIndex) || 1
    return [
      `请为抖音 AI 短剧《${project?.name || '未命名短剧'}》第 ${no} 集写发布文案。`,
      ``,
      `【一句话梗概】${brief.logline || ''}`,
      `【题材】${brief.genre || '逆袭'}`,
      `【本集标题】${ep.title || ''}`,
      `【前 3 秒钩子】${ep.hook || ''}`,
      `【本集冲突】${ep.conflict || ''}`,
      `【结尾卡点】${ep.cliffhanger || ''}`,
      ``,
      `要求：`,
      `1. titles：3 个候选标题，每个不超过 20 个字，带冲突或悬念，不剧透结尾反转。`,
      `2. caption：一段 40~80 字的简介，口语化，结尾留一个让人想评论的问题。`,
      `3. tags：5 个话题标签（不带 # 号），第一个固定为"AI短剧"，其余含题材标签。`,
      `4. coverText：一句不超过 10 个字的封面大字。`,
      ``,
      `严格按这个 JSON 结构输出：`,
      `{"titles":["","",""],"caption":"","tags":["AI短剧","","","",""],"coverText":""}`,
    ].join('\n')
  },
}
