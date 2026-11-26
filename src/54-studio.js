// 成片：试映播放器、胶片时间线、配音与合成。

const MOTION_CLASS = { 固定: 'still', 推: 'push', 拉: 'pull', 摇: 'pan', 移: 'truck', 跟: 'follow', 升降: 'crane' }

/** 试映时每个镜头实际停留多久：台词比镜头长，就等台词念完（与合成规则一致）。 */
const playLength = (shot) => Math.max(Number(shot.duration) || 3, shot.audio?.dur ? Math.round((shot.audio.dur + 0.45) * 10) / 10 : 0, 0.5)

/**
 * 试映：不用等合成，直接按分镜顺序播放关键帧，带运镜动效、字幕和配音。
 * seek 变化时跳到指定镜头。
 */
function Screening({ shots, title, seek, onShot, fitAudio = true }) {
  const [at, setAt] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [tick, setTick] = useState(0)
  const [run, setRun] = useState(0)
  const audio = useRef(null)
  const video = useRef(null)
  const index = Math.min(at, Math.max(0, shots.length - 1))
  const shot = shots[index]
  const lengths = useMemo(() => shots.map((item) => (fitAudio ? playLength(item) : Math.max(0.5, Number(item.duration) || 3))), [shots, fitAudio])
  const total = lengths.reduce((sum, value) => sum + value, 0)
  const before = lengths.slice(0, index).reduce((sum, value) => sum + value, 0)
  const length = lengths[index] || 1

  useEffect(() => {
    if (!seek) return
    setAt(Math.max(0, Math.min(shots.length - 1, seek.index)))
    setTick(0)
    setRun((n) => n + 1)
    if (seek.play) setPlaying(true)
  }, [seek])

  useEffect(() => {
    if (!playing) return undefined
    let last = performance.now()
    let frame
    const loop = (now) => {
      const delta = Math.min(0.1, (now - last) / 1000)
      last = now
      setTick((value) => value + delta)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  useEffect(() => {
    if (!playing || tick < length) return
    if (index < shots.length - 1) { setAt(index + 1); setTick(0); setRun((n) => n + 1) }
    else { setPlaying(false); setTick(length) }
  }, [tick, playing, length, index, shots.length])

  useEffect(() => { onShot?.(shot?.id || null) }, [shot?.id])

  // 配音跟着镜头走：进入镜头 0.15 秒后开口，暂停时一起停。
  useEffect(() => {
    const element = audio.current
    if (!element) return undefined
    element.pause()
    if (!playing || !shot?.audio || muted) return undefined
    element.src = mediaUrl(shot.audio)
    const offset = Math.max(0, tick - 0.15)
    const timer = setTimeout(() => {
      element.currentTime = offset
      element.play().catch(() => {})
    }, tick < 0.15 ? (0.15 - tick) * 1000 : 0)
    return () => { clearTimeout(timer); element.pause() }
  }, [shot?.id, run, playing, muted])

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (playing) element.play().catch(() => {})
    else element.pause()
  }, [playing, shot?.id, run])

  useEffect(() => () => { audio.current?.pause() }, [])

  if (!shot) return h('div', { className: 'db-screen empty' }, h('div', { className: 'db-screen-frame' }, h('span', null, '这一集还没有镜头')))

  const spoken = parseDialogue(shot.dialogue)
  const cues = spoken ? splitSubtitle(spoken.line) : []
  let cue = ''
  if (cues.length) {
    const lead = shot.audio ? 0.15 : 0.1
    const span = shot.audio?.dur ? Math.min(length - lead, shot.audio.dur + 0.2) : length - lead - 0.1
    const chars = cues.reduce((sum, item) => sum + item.length, 0)
    let cursor = lead
    for (const item of cues) {
      const piece = Math.max(0.5, span * item.length / chars)
      if (tick >= cursor && tick < cursor + piece) { cue = item; break }
      cursor += piece
    }
  }
  const toggle = () => {
    if (!playing && index === shots.length - 1 && tick >= length) { setAt(0); setTick(0); setRun((n) => n + 1) }
    setPlaying(!playing)
  }
  const jump = (next) => { setAt(Math.max(0, Math.min(shots.length - 1, next))); setTick(0); setRun((n) => n + 1) }
  const atStart = index === 0 && tick < 0.05 && !playing

  return h('div', { className: 'db-screen' },
    h('div', {
      className: 'db-screen-frame', tabIndex: 0, role: 'button', 'aria-label': playing ? '暂停试映' : '播放试映',
      onClick: toggle, onKeyDown: (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle() } if (e.key === 'ArrowRight') jump(index + 1); if (e.key === 'ArrowLeft') jump(index - 1) },
    },
      shot.video
        ? h('video', { key: `${shot.id}-${run}`, ref: video, src: mediaUrl(shot.video), muted: true, playsInline: true, preload: 'auto' })
        : shot.image
          ? h('img', { key: `${shot.id}-${run}`, className: `db-kb ${MOTION_CLASS[shot.camera] || 'still'}`, src: mediaUrl(shot.image), alt: '', draggable: false, style: { '--dur': `${length}s`, animationPlayState: playing ? 'running' : 'paused' } })
          : h('div', { className: 'db-frame-ph' }, h('i', { className: 'tl' }), h('i', { className: 'tr' }), h('i', { className: 'bl' }), h('i', { className: 'br' }), h('span', null, h('b', null, `镜头 ${pad2(index + 1)}`), h('small', null, '还没有关键帧'))),
      h('div', { className: 'db-screen-bars', 'aria-hidden': true }, shots.map((item, i) => h('i', { key: item.id, style: { flexGrow: lengths[i] } }, h('b', { style: { width: i < index ? '100%' : i === index ? `${Math.min(100, tick / length * 100)}%` : '0%' } })))),
      atStart && title ? h('div', { className: 'db-screen-title' }, title) : null,
      cue ? h('div', { className: 'db-screen-sub' }, cue) : null,
      !playing ? h('span', { className: 'db-screen-play', 'aria-hidden': true }, h(Icon, { name: 'play', size: 30 })) : null),
    h('audio', { ref: audio, preload: 'auto' }),
    h('div', { className: 'db-screen-controls' },
      h(IconBtn, { icon: 'prev', size: 'sm', className: 'ghost', label: '上一个镜头', disabled: index === 0, onClick: () => jump(index - 1) }),
      h(IconBtn, { icon: playing ? 'pause' : 'play', className: 'primary', label: playing ? '暂停' : '播放', onClick: toggle }),
      h(IconBtn, { icon: 'next', size: 'sm', className: 'ghost', label: '下一个镜头', disabled: index === shots.length - 1, onClick: () => jump(index + 1) }),
      h('span', { className: 'db-timecode' }, `${clock(before + Math.min(tick, length))} / ${clock(total)}`),
      h('span', { className: 'db-grow' }),
      h(IconBtn, { icon: muted ? 'mute' : 'volume', size: 'sm', className: 'ghost', label: muted ? '打开声音' : '静音', onClick: () => setMuted(!muted) })))
}

/** 胶片时间线：每格宽度与时长成正比，下面两条轨是字幕和配音。 */
function Timeline({ shots, current, onPick, onOpen }) {
  const studio = useStudio()
  const scale = 26
  return h('div', { className: 'db-timeline', role: 'list', 'aria-label': '时间线' },
    h('div', { className: 'db-timeline-track' }, shots.map((shot, index) => {
      const length = playLength(shot)
      const spoken = parseDialogue(shot.dialogue)
      const job = studio.jobFor({ shotId: shot.id, field: 'image' }) || studio.jobFor({ shotId: shot.id, field: 'video' })
      return h('div', { key: shot.id, role: 'listitem', className: cx('db-cell-shot', shot.id === current && 'on'), style: { width: Math.max(62, length * scale) } },
        h('button', { type: 'button', className: 'db-film', onClick: () => onPick(index), onDoubleClick: () => onOpen(shot.id), 'aria-label': `镜头 ${index + 1}，${length} 秒`, title: '单击定位，双击去分镜页修改' },
          shot.image ? h('img', { src: mediaUrl(shot.image), alt: '', loading: 'lazy', draggable: false }) : h('span', { className: 'db-film-empty' }, shot.shotSize),
          job ? h('span', { className: 'db-frame-sweep' }) : null,
          h('b', null, pad2(index + 1)),
          shot.video ? h('i', null, h(Icon, { name: 'film', size: 11 })) : null,
          h('time', null, `${length}s`)),
        h('div', { className: cx('db-track-sub', !spoken && 'none') }, spoken ? spoken.line : ''),
        h('div', { className: cx('db-track-voice', shot.audio ? 'has' : spoken ? 'need' : 'none') },
          shot.audio ? h('span', { style: { width: `${Math.min(100, (shot.audio.dur || length) / length * 100)}%` } }) : null))
    })),
    h('div', { className: 'db-timeline-legend' }, h('span', null, '画面'), h('span', null, '字幕'), h('span', null, '配音')))
}

function Step({ n, name, done, total, state, children }) {
  const complete = total > 0 && done >= total
  return h('li', { className: cx('db-step', complete && 'done') },
    h(Ring, { value: total ? done / total : 0, size: 36 }, complete ? h(Icon, { name: 'check', size: 14 }) : n),
    h('div', { className: 'db-step-body' },
      h('div', { className: 'db-step-head' }, h('strong', null, name), h('span', { className: 'db-muted' }, state)),
      children))
}

function StudioPage() {
  const studio = useStudio()
  const { project, episodeIndex, engine, jobs, navigate, patch, toast } = studio
  const [seek, setSeek] = useState(null)
  const [current, setCurrent] = useState(null)
  const shots = shotsOf(project, episodeIndex)
  const episode = project.episodes.find((e) => e.index === episodeIndex)
  const progress = episodeProgress(project, episodeIndex)
  const options = engine?.settings?.render || {}
  const tools = engine?.tools
  const renderJob = jobs.find((job) => isActive(job) && job.type === 'render' && job.target?.id === episode?.id)
  const voiceJobs = jobs.filter((job) => isActive(job) && job.type === 'tts' && shots.some((shot) => shot.id === job.target?.shotId))
  const imageJobs = jobs.filter((job) => isActive(job) && job.type === 'image' && shots.some((shot) => shot.id === job.target?.shotId))
  const videoJobs = jobs.filter((job) => isActive(job) && job.type === 'video' && shots.some((shot) => shot.id === job.target?.shotId))
  const missing = shots.filter((shot) => !shot.image)
  const unvoiced = shots.filter((shot) => parseDialogue(shot.dialogue) && (!shot.audio || (shot.audioText && shot.audioText !== parseDialogue(shot.dialogue).line)))
  const latest = episode?.renders?.[0] || null
  const setOption = (change) => studio.saveEngine({ render: change })
  const length = shots.reduce((sum, shot) => sum + playLength(shot), 0)
  const title = episode ? `第${episodeIndex}集 ${episode.title.replace(/^第\s*\d+\s*集[：:\s]*/, '')}` : ''

  const uploadBgm = async (file) => {
    try {
      const asset = await uploadMedia(project.id, file, { name: `配乐 ${file.name}` })
      if (asset.kind !== 'audio') throw new Error('配乐需要是音频文件（MP3 / M4A / WAV）')
      patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) target.bgm = asset })
    } catch (error) {
      toast('err', error.message)
    }
  }

  if (!shots.length) {
    return h('div', { className: 'db-stack' }, h(EpisodeTabs),
      h(Empty, { icon: 'studio', title: `第 ${episodeIndex} 集还没有镜头`, action: h(Btn, { kind: 'primary', icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去拆分镜') }, '成片从分镜开始：先把这一集拆成镜头，再回来配音和合成。'))
  }

  return h('div', { className: 'db-stack' },
    h(EpisodeTabs),
    h('div', { className: 'db-studio' },
      h(Screening, { key: `${project.id}-${episodeIndex}`, shots, title, seek, onShot: setCurrent, fitAudio: options.fitAudio !== false }),

      h('div', { className: 'db-studio-side' },
        h('ol', { className: 'db-steps' },
          h(Step, { n: 1, name: '关键帧', done: progress.images, total: shots.length, state: `${progress.images} / ${shots.length} 个镜头有画面` },
            h('div', { className: 'db-row' },
              missing.length
                ? h(Btn, { size: 'sm', kind: 'primary', icon: 'image', disabled: imageJobs.length > 0, busy: imageJobs.length > 0, onClick: () => studio.generateImages(episodeIndex, missing.map((shot) => shot.id)) }, imageJobs.length ? `出图中，还剩 ${imageJobs.length} 张` : `给 ${missing.length} 个镜头出图`)
                : null,
              missing.length && !imageJobs.length ? h(Btn, { size: 'sm', icon: 'pencil', onClick: () => studio.sketchShots(episodeIndex, missing.map((shot) => shot.id)) }, '先画草图') : null,
              h(Btn, { size: 'sm', kind: 'ghost', icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去分镜页调整'))),

          h(Step, { n: 2, name: '配音', done: progress.voiced - progress.stale, total: progress.spoken, state: progress.spoken ? `${progress.voiced} / ${progress.spoken} 句台词${progress.stale ? `，${progress.stale} 句需要重配` : ''}` : '这一集没有台词' },
            progress.spoken ? h('div', { className: 'db-row' },
              h(Btn, { size: 'sm', kind: unvoiced.length ? 'primary' : undefined, icon: 'mic', disabled: voiceJobs.length > 0 || !unvoiced.length, busy: voiceJobs.length > 0, onClick: () => studio.generateVoices(episodeIndex, unvoiced.map((shot) => shot.id)) },
                voiceJobs.length ? `配音中，还剩 ${voiceJobs.length} 句` : unvoiced.length ? `给 ${unvoiced.length} 句台词配音` : '配音已齐'),
              h(Btn, { size: 'sm', kind: 'ghost', icon: 'cast', onClick: () => navigate('cast') }, '调整音色'),
              h('span', { className: 'db-muted' }, engine?.settings?.tts?.vendor === 'system' ? '系统语音' : engine?.catalog?.tts?.find((item) => item.id === engine.settings.tts.vendor)?.name)) : null),

          h(Step, { n: 3, name: '动态', done: studio.videoVendor === 'local' ? progress.images : progress.videos, total: shots.length, state: studio.videoVendor === 'local' ? '本地运镜动效，合成时自动添加' : `${progress.videos} / ${shots.length} 个镜头有 AI 视频` },
            h('div', { className: 'db-row' },
              studio.videoVendor !== 'local'
                ? h(Btn, { size: 'sm', icon: 'film', disabled: videoJobs.length > 0, busy: videoJobs.length > 0, onClick: () => studio.generateVideos(episodeIndex, shots.filter((shot) => shot.image && !shot.video).map((shot) => shot.id)) }, videoJobs.length ? `生成中，还剩 ${videoJobs.length} 段` : '给有画面的镜头生成视频')
                : h(Btn, { size: 'sm', kind: 'ghost', icon: 'engine', onClick: () => navigate('engine') }, '接入图生视频'),
              videoJobs.length ? h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs(videoJobs.map((job) => job.id)) }, '停止') : null)),

          h(Step, { n: 4, name: '合成', done: latest ? 1 : 0, total: 1, state: latest ? `已合成 ${clock(latest.dur || 0)}` : `预计 ${clock(length)}` },
            h('div', { className: 'db-options' },
              h('label', null, h('input', { type: 'checkbox', checked: options.subtitles !== false, onChange: (e) => setOption({ subtitles: e.target.checked }) }), '烧录字幕'),
              h('label', null, h('input', { type: 'checkbox', checked: options.titleCard !== false, onChange: (e) => setOption({ titleCard: e.target.checked }) }), '开头显示集标题'),
              h('label', null, h('input', { type: 'checkbox', checked: options.fitAudio !== false, onChange: (e) => setOption({ fitAudio: e.target.checked }) }), '台词没念完时延长镜头'),
              h('label', null, '清晰度', h('select', { className: 'db-select', value: options.width || 720, onChange: (e) => setOption({ width: Number(e.target.value) }) }, h('option', { value: 540 }, '540p（快）'), h('option', { value: 720 }, '720p'), h('option', { value: 1080 }, '1080p（慢）')))),
            h('div', { className: 'db-row' },
              episode.bgm
                ? h(Fragment, null, h(Tag, { icon: 'music' }, '已添加配乐'), h(AudioChip, { asset: episode.bgm }),
                  h('label', { className: 'db-range' }, '音量', h('input', { type: 'range', min: 0, max: 0.6, step: 0.02, value: options.bgmVolume ?? 0.22, onChange: (e) => setOption({ bgmVolume: Number(e.target.value) }) })),
                  h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除配乐', onClick: () => patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) target.bgm = null }) }))
                : h(FilePick, { size: 'sm', kind: 'ghost', icon: 'music', accept: 'audio/*,.mp3,.m4a,.wav', onPick: uploadBgm }, '添加配乐')),
            tools && !tools.ffmpeg
              ? h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '没有找到 ffmpeg，无法合成。macOS 可运行 brew install ffmpeg，或到「生成引擎」填写它的路径。')
              : null,
            renderJob
              ? h('div', { className: 'db-render-progress', role: 'status' },
                h('div', { className: 'db-bar rec' }, h('span', { style: { width: `${Math.round((renderJob.progress || 0) * 100)}%` } })),
                h('span', null, renderJob.message, ` ${Math.round((renderJob.progress || 0) * 100)}%`),
                h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs([renderJob.id]) }, '取消'))
              : h(Btn, { kind: latest ? undefined : 'primary', className: latest ? '' : 'rec', icon: 'film', disabled: tools && !tools.ffmpeg, onClick: () => studio.renderEpisode(episodeIndex) }, latest ? '重新合成 MP4' : '合成 MP4'))),

        latest ? h('section', { className: 'db-output' },
          h(Frame, { video: latest, onOpen: () => studio.setLightbox({ items: [{ asset: latest, title: `${project.name} ${title}`, note: `${latest.w}×${latest.h}` }] }) }, h('span', { className: 'db-play-badge' }, h(Icon, { name: 'play', size: 16 }))),
          h('div', { className: 'db-output-body' },
            h('strong', null, `${project.name} ${title}`),
            h('span', { className: 'db-muted' }, `${latest.w}×${latest.h}，${clock(latest.dur || 0)}，${new Date(latest.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`),
            h('div', { className: 'db-row' },
              h(Btn, { kind: 'primary', size: 'sm', icon: 'download', onClick: () => downloadUrl(mediaUrl(latest), `${safeName(project.name)}-第${episodeIndex}集.mp4`) }, '下载 MP4'),
              h(Btn, { size: 'sm', icon: 'publish', onClick: () => navigate('publish', episodeIndex) }, '准备发布'),
              episode.renders.length > 1 ? h('span', { className: 'db-muted' }, `另有 ${episode.renders.length - 1} 个旧版本在素材库`) : null))) : null)),

    h(Timeline, { shots, current, onPick: (index) => setSeek({ index, nonce: Date.now() }), onOpen: (shotId) => navigate('board', episodeIndex, shotId) }))
}
