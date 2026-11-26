// 工作台状态：项目数据、自动保存、撤销、后台任务、引擎配置与所有生成动作。
const StudioContext = createContext(null)
const useStudio = () => useContext(StudioContext)
const clone = (value) => JSON.parse(JSON.stringify(value))
const isActive = (job) => job.status === 'queued' || job.status === 'running'

function useStudioState() {
  const [store, setStore] = useState({ projects: [], activeId: null })
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState('overview')
  const [episodeIndex, setEpisodeIndex] = useState(1)
  const [selectedShot, setSelectedShot] = useState(null)
  const [busy, setBusy] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [retrySave, setRetrySave] = useState(0)
  const [model, setModel] = useState(null)
  const [engine, setEngine] = useState(null)
  const [jobs, setJobs] = useState([])
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const [undoStore, setUndoStore] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('drama-studio-theme') || 'light' } catch { return 'light' } })

  const current = useRef(store)
  current.current = store
  const savedSnapshot = useRef('')
  const pendingSave = useRef(null)
  const writing = useRef(false)
  const mounted = useRef(true)
  const dialogResolve = useRef(null)
  const handled = useRef(new Set())
  const abortText = useRef(null)

  const project = useMemo(() => store.projects.find((p) => p.id === store.activeId) || null, [store])

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => { try { localStorage.setItem('drama-studio-theme', theme) } catch { /* 记不住也没关系 */ } }, [theme])
  useEffect(() => {
    if (!busy) { setElapsed(0); return undefined }
    const started = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [busy])
  useEffect(() => {
    if (project && !project.episodes.some((e) => e.index === episodeIndex)) setEpisodeIndex(project.episodes[0]?.index || 1)
  }, [project?.id, project?.episodes.length, episodeIndex])

  //#region 提示与确认
  const toast = useCallback((tone, text, action) => {
    const id = uid('t')
    setToasts((list) => [...list.slice(-3), { id, tone, text, action }])
    if (tone !== 'err') setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 4200)
  }, [])
  const copy = useCallback(async (text, what = '内容') => {
    const ok = Boolean(text) && await copyText(text)
    toast(ok ? 'ok' : 'err', ok ? `已复制${what}。` : '复制失败，请手动选中文本复制。')
  }, [toast])
  const dismissToast = useCallback((id) => setToasts((list) => list.filter((item) => item.id !== id)), [])

  /** 弹确认框。返回 true（主操作）、'alt'（次操作）或 false（取消）。 */
  const ask = useCallback((title, text, action = '确认', options = {}) => new Promise((resolve) => {
    dialogResolve.current = resolve
    setDialog({ title, text, action, ...options })
  }), [])
  const answer = useCallback((value) => { setDialog(null); dialogResolve.current?.(value); dialogResolve.current = null }, [])
  //#endregion

  //#region 读取与保存
  const reloadEngine = useCallback(async () => {
    try {
      const view = await request('settings')
      if (mounted.current) setEngine(view)
      return view
    } catch (error) {
      if (mounted.current) setEngine({ error: error.message })
      return null
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const payload = await request('state')
        if (!alive) return
        const initial = normalizeStore(payload.state)
        savedSnapshot.current = JSON.stringify(initial)
        setStore(initial)
        setModel(payload.model || null)
        setLoaded(true)
      } catch (error) {
        if (alive) setLoadError(error.message)
      }
    })()
    reloadEngine()
    return () => { alive = false }
  }, [reloadEngine])

  // 串行写入：慢的旧请求不能盖掉新的编辑。
  useEffect(() => {
    if (!loaded) return undefined
    const snapshot = JSON.stringify(store)
    if (snapshot === savedSnapshot.current && !writing.current && !pendingSave.current) return undefined
    pendingSave.current = store
    setSaving(true)
    const drain = async () => {
      if (writing.current) return
      writing.current = true
      try {
        while (pendingSave.current) {
          const next = pendingSave.current
          pendingSave.current = null
          try {
            await request('state', { state: next })
            savedSnapshot.current = JSON.stringify(next)
            if (mounted.current) setSaveError(false)
          } catch (error) {
            pendingSave.current = pendingSave.current || next
            if (mounted.current) { setSaveError(true); toast('err', `尚未保存：${error.message}。请重试或导出备份。`) }
            break
          }
        }
      } finally {
        writing.current = false
        if (mounted.current) setSaving(false)
      }
    }
    const timer = setTimeout(drain, 600)
    return () => clearTimeout(timer)
  }, [store, loaded, retrySave, toast])

  useEffect(() => {
    const handler = (event) => {
      if (savedSnapshot.current && JSON.stringify(current.current) !== savedSnapshot.current) { event.preventDefault(); event.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  /** 修改一个项目（默认是当前项目）。 */
  const patch = useCallback((mutate, pid) => {
    setStore((state) => {
      const id = pid || state.activeId
      const target = state.projects.find((p) => p.id === id)
      if (!target) return state
      const draft = clone(target)
      mutate(draft)
      draft.updatedAt = Date.now()
      return { ...state, projects: state.projects.map((p) => (p.id === id ? draft : p)) }
    })
  }, [])

  const patchShot = useCallback((shotId, mutate) => patch((draft) => {
    for (const list of Object.values(draft.boards)) {
      const shot = list.find((item) => item.id === shotId)
      if (shot) { mutate(shot, list); return }
    }
  }), [patch])
  //#endregion

  //#region 项目管理
  const navigate = useCallback((next, index, shotId) => {
    setTab(next)
    if (index) setEpisodeIndex(index)
    if (shotId !== undefined) setSelectedShot(shotId)
    document.querySelector('.db-scroll')?.scrollTo({ top: 0 })
  }, [])

  const createProject = useCallback(() => {
    const created = makeProject(`新短剧 ${new Date().toLocaleDateString('zh-CN')}`)
    created.episodes = Array.from({ length: 3 }, (_, i) => blankEpisode(i + 1))
    created.brief.episodes = 3
    setUndoStore(current.current)
    setStore((state) => ({ projects: [created, ...state.projects], activeId: created.id }))
    setTab('brief')
    setEpisodeIndex(1)
    setSelectedShot(null)
    toast('ok', '已新建项目，先写一句故事梗概。')
  }, [toast])

  const switchProject = useCallback((id) => {
    setStore((state) => ({ ...state, activeId: id }))
    setEpisodeIndex(1)
    setSelectedShot(null)
  }, [])

  const duplicateProject = useCallback(() => {
    if (!project) return
    const copy = normalizeProject(clone(project))
    copy.id = uid('p')
    copy.name += ' 副本'
    copy.createdAt = copy.updatedAt = Date.now()
    setUndoStore(current.current)
    setStore((state) => ({ projects: [copy, ...state.projects], activeId: copy.id }))
    toast('ok', '已创建副本。图片和视频与原项目共用，不会重复占用空间。')
  }, [project, toast])

  const deleteProject = useCallback(async () => {
    if (!project) return
    if (!await ask('删除这个项目？', `「${project.name}」的角色、分集与分镜将一起删除。已生成的图片和视频仍保留在素材目录里。可用撤销恢复。`, '删除项目', { danger: true })) return
    setUndoStore(current.current)
    setStore((state) => {
      const projects = state.projects.filter((p) => p.id !== project.id)
      return { projects, activeId: projects[0]?.id ?? null }
    })
    setTab('overview')
    toast('info', '项目已删除。')
  }, [project, ask, toast])

  const backupProject = useCallback(() => {
    if (!project) return
    download(`${safeName(project.name)}-备份.json`, JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), projects: [project], activeId: project.id }, null, 2), 'application/json;charset=utf-8')
    toast('ok', '已导出项目备份（文字与素材引用；图片和视频文件在素材目录里）。')
  }, [project, toast])

  const importBackup = useCallback(async (file) => {
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('备份文件不能超过 10 MB。')
      const raw = JSON.parse(await file.text())
      const list = Array.isArray(raw.projects) ? raw.projects : raw.brief ? [raw] : null
      if (!list?.length || list.length > 100 || list.some((p) => !p || typeof p.name !== 'string' || !p.brief || !Array.isArray(p.characters) || !Array.isArray(p.episodes) || !p.boards || Array.isArray(p.boards) || typeof p.boards !== 'object')) {
        throw new Error('请选择包含项目名称、立项、角色、分集和分镜的有效 JSON 备份。')
      }
      const imported = list.map((item) => { const p = normalizeProject(item); p.id = uid('p'); p.updatedAt = Date.now(); return p })
      setUndoStore(current.current)
      setStore((state) => ({ projects: [...imported, ...state.projects], activeId: imported[0].id }))
      setTab('overview')
      setEpisodeIndex(1)
      toast('ok', `已导入 ${imported.length} 个项目，原有项目已保留。`)
    } catch (error) {
      toast('err', `导入失败：${error.message}`)
    }
  }, [toast])

  const undo = useCallback(() => {
    if (!undoStore) return
    setStore(undoStore)
    setUndoStore(null)
    toast('ok', '已撤销上次操作。')
  }, [undoStore, toast])
  //#endregion

  //#region 后台任务
  /** 把任务结果写回它所属的镜头 / 角色 / 分集。 */
  const applyJob = useCallback((job) => {
    const asset = normalizeRef(job.result?.asset)
    const target = job.target
    if (!asset || !target) return
    patch((draft) => {
      if (target.kind === 'shot') {
        for (const list of Object.values(draft.boards)) {
          const shot = list.find((item) => item.id === target.shotId)
          if (!shot) continue
          if (target.field === 'image') { shot.image = asset; shot.images = [asset, ...shot.images.filter((item) => item.file !== asset.file)].slice(0, 8) }
          if (target.field === 'video') shot.video = asset
          if (target.field === 'audio') { shot.audio = asset; shot.audioText = target.text || '' }
          return
        }
      }
      if (target.kind === 'character') {
        const character = draft.characters.find((item) => item.id === target.id)
        if (character) { character.portrait = asset; character.portraits = [asset, ...character.portraits.filter((item) => item.file !== asset.file)].slice(0, 8) }
      }
      if (target.kind === 'episode') {
        const episode = draft.episodes.find((item) => item.id === target.id)
        if (episode) episode.renders = [asset, ...episode.renders].slice(0, 5)
      }
    }, job.pid)
  }, [patch])

  const refreshJobs = useCallback(async () => {
    let list
    try {
      list = (await request('jobs')).jobs || []
    } catch {
      return
    }
    if (!mounted.current) return
    const acks = []
    for (const job of list) {
      if (isActive(job) || handled.current.has(job.id)) continue
      handled.current.add(job.id)
      if (job.status === 'done') {
        applyJob(job)
        acks.push(job.id)
        if (job.type === 'render') {
          const missing = job.result?.missingImages
          toast('ok', `${job.label}已合成，时长 ${job.result?.total} 秒${missing ? `（${missing} 个镜头还没有图，用占位画面代替）` : ''}。`)
        }
      } else if (job.status === 'canceled') {
        acks.push(job.id)
      } else if (job.status === 'error') {
        toast('err', `${job.label || '任务'}失败：${job.error}`)
      }
    }
    if (acks.length) request('jobs/ack', { ids: acks }).catch(() => {})
    setJobs(list.filter((job) => !acks.includes(job.id)))
  }, [applyJob, toast])

  useEffect(() => { if (loaded) refreshJobs() }, [loaded, refreshJobs])
  const hasActiveJobs = jobs.some(isActive)
  useEffect(() => {
    if (!hasActiveJobs) return undefined
    const timer = setInterval(refreshJobs, 1200)
    return () => clearInterval(timer)
  }, [hasActiveJobs, refreshJobs])

  const queue = useCallback(async (list) => {
    if (!project || !list.length) return []
    try {
      const payload = await request('jobs', { pid: project.id, jobs: list })
      setJobs((existing) => [...existing, ...payload.jobs])
      return payload.jobs
    } catch (error) {
      toast('err', error.message)
      return []
    }
  }, [project, toast])

  const cancelJobs = useCallback(async (ids) => {
    try { await request('jobs/cancel', { ids }) } catch { /* 下一轮轮询会纠正 */ }
    refreshJobs()
  }, [refreshJobs])

  const dismissJobs = useCallback(async (ids) => {
    setJobs((list) => list.filter((job) => !ids.includes(job.id)))
    try { await request('jobs/ack', { ids }) } catch { /* 已经从列表里拿掉了 */ }
  }, [])

  /** 某个镜头 / 角色当前正在跑的任务。 */
  const jobFor = useCallback((match) => jobs.find((job) => isActive(job) && job.target && Object.entries(match).every(([key, value]) => job.target[key] === value)) || null, [jobs])
  //#endregion

  //#region 生成动作
  const imageVendor = engine?.settings?.image?.vendor || 'none'
  const videoVendor = engine?.settings?.video?.vendor || 'local'

  const sketchShots = useCallback(async (index, shotIds) => {
    if (!project) return
    const shots = shotsOf(project, index)
    let made = 0
    for (const [position, shot] of shots.entries()) {
      if (!shotIds.includes(shot.id)) continue
      try {
        const blob = await renderSketch(project, shot, position)
        const asset = await uploadMedia(project.id, blob, { name: `草图 第${index}集 镜头${position + 1}`, source: 'sketch', target: { kind: 'shot', shotId: shot.id, field: 'image' } })
        applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: 'image' }, result: { asset } })
        made += 1
      } catch (error) {
        toast('err', `镜头 ${position + 1} 草图失败：${error.message}`)
        break
      }
    }
    if (made) toast('ok', `已画好 ${made} 张分镜草图。接入出图引擎后可以随时换成 AI 画面。`)
  }, [project, applyJob, toast])

  /** 给一批镜头出图。没接出图引擎时，问用户是去接入还是先画草图。 */
  const generateImages = useCallback(async (index, shotIds) => {
    if (!project || !shotIds.length) return
    if (imageVendor === 'none') {
      const choice = await ask('还没有接入出图引擎', '接入火山方舟（即梦同款）、智谱或硅基流动后，就能按提示词生成真实画面。也可以先用本地草图把流程跑通。', '去接入', { alt: '先画草图' })
      if (choice === true) navigate('engine')
      if (choice === 'alt') await sketchShots(index, shotIds)
      return
    }
    const shots = shotsOf(project, index)
    const list = []
    let skipped = 0
    shots.forEach((shot, position) => {
      if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'image' })) return
      const composed = composeImagePrompt(project, shot)
      if (!composed.prompt) { skipped += 1; return }
      list.push({
        type: 'image', label: `第${index}集 镜头 ${position + 1} 出图`,
        target: { kind: 'shot', shotId: shot.id, field: 'image' },
        payload: { prompt: composed.prompt, negative: project.visual.negative, width: 720, height: 1280, refs: composed.refs.map(({ pid, file, mime }) => ({ pid, file, mime })) },
      })
    })
    if (skipped) toast('info', `${skipped} 个镜头没有画面描述，已跳过。`)
    await queue(list)
  }, [project, imageVendor, ask, navigate, sketchShots, jobFor, queue, toast])

  const generatePortrait = useCallback(async (characterId) => {
    const character = project?.characters.find((item) => item.id === characterId)
    if (!character) return
    if (!character.appearance.trim()) { toast('err', '先填写固定外貌，再生成定妆照。'); return }
    if (imageVendor === 'none') {
      if (await ask('还没有接入出图引擎', '定妆照需要 AI 出图。接入后，定妆照还会作为参考图帮助角色跨镜头保持一致。', '去接入')) navigate('engine')
      return
    }
    await queue([{
      type: 'image', label: `${character.name || '角色'} 定妆照`, target: { kind: 'character', id: character.id },
      payload: { prompt: composePortraitPrompt(project, character), negative: project.visual.negative, width: 720, height: 1280, refs: [] },
    }])
  }, [project, imageVendor, ask, navigate, queue, toast])

  const voiceFor = useCallback((speaker) => {
    const character = project?.characters.find((item) => item.name.trim() && item.name.trim() === speaker)
    return character?.voice || project?.narratorVoice || ''
  }, [project])

  const generateVoices = useCallback(async (index, shotIds) => {
    if (!project) return
    const list = []
    shotsOf(project, index).forEach((shot, position) => {
      if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'audio' })) return
      const spoken = parseDialogue(shot.dialogue)
      if (!spoken) return
      list.push({
        type: 'tts', label: `第${index}集 镜头 ${position + 1} 配音`,
        target: { kind: 'shot', shotId: shot.id, field: 'audio', text: spoken.line },
        payload: { text: spoken.line, voice: voiceFor(spoken.speaker) },
      })
    })
    if (!list.length) { toast('info', '这些镜头没有需要配音的台词。'); return }
    await queue(list)
  }, [project, jobFor, voiceFor, queue, toast])

  const generateVideos = useCallback(async (index, shotIds) => {
    if (!project) return
    if (videoVendor === 'local') {
      if (await ask('当前是本地运镜动效', '合成成片时会按每个镜头的运镜方式自动加动效，不需要单独生成。要让画面里的人物真的动起来，请接入图生视频引擎。', '去接入')) navigate('engine')
      return
    }
    const list = []
    let noImage = 0
    shotsOf(project, index).forEach((shot, position) => {
      if (!shotIds.includes(shot.id) || jobFor({ shotId: shot.id, field: 'video' })) return
      if (!shot.image) { noImage += 1; return }
      list.push({
        type: 'video', label: `第${index}集 镜头 ${position + 1} 视频`,
        target: { kind: 'shot', shotId: shot.id, field: 'video' },
        payload: { prompt: shot.videoPrompt.trim() || shot.description.trim(), image: { pid: shot.image.pid, file: shot.image.file, mime: shot.image.mime }, duration: shot.duration },
      })
    })
    if (noImage) toast('info', `${noImage} 个镜头还没有关键帧，图生视频需要先出图。`)
    await queue(list)
  }, [project, videoVendor, ask, navigate, jobFor, queue, toast])

  const renderEpisode = useCallback(async (index) => {
    if (!project) return
    const episode = project.episodes.find((item) => item.index === index)
    const shots = shotsOf(project, index)
    if (!episode || !shots.length) { toast('err', '这一集还没有镜头。'); return }
    if (jobs.some((job) => isActive(job) && job.type === 'render' && job.target?.id === episode.id)) return
    const options = engine?.settings?.render || {}
    const pick = ({ pid, file, mime, dur }) => ({ pid, file, mime, dur })
    await queue([{
      type: 'render', label: `第${index}集`, target: { kind: 'episode', id: episode.id },
      payload: {
        shots: shots.map((shot, position) => ({
          image: shot.image ? pick(shot.image) : null,
          video: shot.video ? pick(shot.video) : null,
          audio: shot.audio ? pick(shot.audio) : null,
          duration: shot.duration, camera: shot.camera,
          subtitle: parseDialogue(shot.dialogue)?.line || '',
          label: `镜头 ${position + 1}`,
        })),
        options: {
          width: options.width, fps: options.fps, subtitles: options.subtitles, fitAudio: options.fitAudio,
          title: options.titleCard === false ? '' : `第${index}集 ${episode.title.replace(/^第\s*\d+\s*集[：:\s]*/, '')}`.trim(),
          bgm: episode.bgm ? pick(episode.bgm) : null, bgmVolume: options.bgmVolume,
        },
      },
    }])
  }, [project, engine, jobs, queue, toast])

  /** 文本生成：大纲、角色、分集、分镜、发布文案。 */
  const generate = useCallback(async (kind, index = episodeIndex) => {
    if (!project || busy) return
    if (kind === 'outline' && !project.brief.logline.trim()) { toast('err', '先写一句故事梗概，再生成大纲。'); return }
    const hasBoards = Object.values(project.boards).some((list) => list.length)
    const hasEpisodes = project.episodes.some((e) => e.hook || e.conflict || e.cliffhanger)
    const existing = kind === 'outline' ? project.characters.length || hasEpisodes || hasBoards
      : kind === 'characters' ? project.characters.length
        : kind === 'episodes' ? hasEpisodes || hasBoards
          : kind === 'storyboard' ? shotsOf(project, index).length
            : 0
    if (existing) {
      const detail = kind === 'outline' || kind === 'episodes'
        ? '本次生成将替换对应角色或分集；重新生成分集也会清空原有分镜和它们的画面，避免镜头与故事错配。完成后可撤销，也可先取消并导出备份。'
        : kind === 'storyboard' ? '这一集已有的镜头（含已出的图和配音）会被新分镜替换。完成后可撤销。'
          : '本次生成将替换已有角色（定妆照会一并清空）。完成后可撤销。'
      if (!await ask('替换已有创作内容？', detail, '确认替换')) return
    }
    const pid = project.id
    const snapshot = current.current
    const controller = new AbortController()
    abortText.current = controller
    setBusy(kind)
    try {
      const episode = project.episodes.find((e) => e.index === index) || { index, title: `第${index}集`, hook: '', conflict: '', cliffhanger: '' }
      // 只把文字发给模型，素材引用留在本机。
      const lean = { name: project.name, brief: project.brief, characters: project.characters.map(({ name, identity, personality, appearance }) => ({ name, identity, personality, appearance })) }
      const response = await fetch(`${API}/generate`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ kind, project: lean, episode, episodeIndex: index }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `请求失败（HTTP ${response.status}）`)
      const data = payload.data || {}
      if (kind === 'publish') {
        if (!Array.isArray(data.titles) || !data.titles.length) throw new Error('AI 未返回有效内容，请重试。')
      } else {
        const required = kind === 'outline' ? ['characters', 'episodes'] : [kind === 'storyboard' ? 'shots' : kind]
        if (required.some((key) => !Array.isArray(data[key]) || !data[key].length || data[key].some((item) => !item || typeof item !== 'object'))) throw new Error('AI 未返回有效内容，原有数据已保留，请重试。')
      }
      if (payload.model) setModel(payload.model)
      if (kind !== 'publish') setUndoStore(snapshot)
      patch((draft) => {
        if (kind === 'outline' || kind === 'characters') {
          draft.characters = data.characters.map((item) => ({
            id: uid('c'), name: String(item?.name ?? ''), identity: String(item?.identity ?? ''),
            personality: String(item?.personality ?? ''), appearance: String(item?.appearance ?? ''),
            portrait: null, portraits: [], voice: '',
          }))
        }
        if (kind === 'outline' || kind === 'episodes') {
          draft.boards = {}
          draft.episodes = data.episodes.map((item, i) => ({
            ...blankEpisode(i + 1), title: String(item?.title ?? `第${i + 1}集`), hook: String(item?.hook ?? ''),
            conflict: String(item?.conflict ?? ''), cliffhanger: String(item?.cliffhanger ?? ''),
          }))
          draft.brief.episodes = draft.episodes.length
        }
        if (kind === 'storyboard') {
          while (draft.episodes.length < index) draft.episodes.push(blankEpisode(draft.episodes.length + 1))
          draft.boards[String(index)] = data.shots.map((item) => normalizeShot({ ...item, id: uid('s'), duration: Number(item?.duration) > 0 ? Number(item.duration) : 3, image: null, images: [], video: null, audio: null }))
        }
        if (kind === 'publish') {
          const target = draft.episodes.find((e) => e.index === index)
          if (target) {
            target.publish = {
              ...blankPublish(), platform: platformOf(target.publish?.platform).id,
              titles: data.titles.map(String).slice(0, 6), caption: String(data.caption ?? ''),
              tags: (Array.isArray(data.tags) ? data.tags : []).map((tag) => String(tag).replace(/^#/, '')).filter(Boolean).slice(0, 8),
              coverText: String(data.coverText ?? ''), pick: 0,
            }
          }
        }
      }, pid)
      if (kind === 'storyboard') setSelectedShot(null)
      toast('ok', kind === 'outline' ? `大纲已生成：${data.characters.length} 个角色、${data.episodes.length} 集。`
        : kind === 'characters' ? `角色卡已更新：${data.characters.length} 个角色。`
          : kind === 'episodes' ? `分集已更新：${data.episodes.length} 集。`
            : kind === 'storyboard' ? `第 ${index} 集分镜已生成：${data.shots.length} 个镜头。下一步可以批量出图。`
              : `第 ${index} 集发布文案已生成。`)
    } catch (error) {
      if (controller.signal.aborted) toast('info', '已取消生成。')
      else toast('err', error.message)
    } finally {
      abortText.current = null
      setBusy(null)
    }
  }, [project, busy, episodeIndex, ask, patch, toast])

  const cancelGenerate = useCallback(() => abortText.current?.abort(), [])

  const saveEngine = useCallback(async (change) => {
    try {
      const view = await request('settings', change)
      setEngine(view)
      request('state').then((payload) => { if (mounted.current) setModel(payload.model || null) }).catch(() => {})
      return view
    } catch (error) {
      toast('err', `引擎配置没有保存：${error.message}`)
      return null
    }
  }, [toast])
  //#endregion

  return {
    store, project, loaded, loadError, tab, episodeIndex, setEpisodeIndex, selectedShot, setSelectedShot,
    busy, elapsed, saving, saveError, retry: () => setRetrySave((n) => n + 1), model, engine, jobs, toasts, dialog, undoStore, theme, setTheme,
    lightbox, setLightbox, toast, copy, dismissToast, ask, answer, patch, patchShot, navigate,
    createProject, switchProject, duplicateProject, deleteProject, backupProject, importBackup, undo, setUndoStore,
    queue, cancelJobs, dismissJobs, jobFor, applyJob,
    imageVendor, videoVendor, sketchShots, generateImages, generatePortrait, generateVoices, generateVideos, renderEpisode,
    generate, cancelGenerate, reloadEngine, saveEngine, voiceFor,
  }
}
