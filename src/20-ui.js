// 通用界面组件：图标、按钮、表单、画框、灯箱、菜单。
const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  brief: 'M8 3h8l4 4v14H4V3h4m8 0v5h4M8 12h8m-8 4h6',
  cast: 'M15 21v-2a5 5 0 0 0-10 0v2m12-15a4 4 0 0 1 0 8m2 3a4 4 0 0 1 3 4M14 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  episodes: 'M8 3h12v16M4 7h12v14H4zM8 11h4m-4 4h4',
  board: 'M3 4h18v16H3zM3 9h18M8 4l3 5m4-5 3 5',
  studio: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  publish: 'M12 16V4m-5 5 5-5 5 5M4 15v5h16v-5',
  library: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  engine: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6m8-3a8 8 0 0 0-.2-1.7l2-1.5-2-3.4-2.3 1a8 8 0 0 0-3-1.7L14 2h-4l-.5 2.7a8 8 0 0 0-3 1.7l-2.3-1-2 3.4 2 1.5a8 8 0 0 0 0 3.4l-2 1.5 2 3.4 2.3-1a8 8 0 0 0 3 1.7L10 22h4l.5-2.7a8 8 0 0 0 3-1.7l2.3 1 2-3.4-2-1.5A8 8 0 0 0 20 12',
  plus: 'M12 5v14M5 12h14', search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  chevron: 'm9 5 7 7-7 7', back: 'm15 5-7 7 7 7', down: 'm5 9 7 7 7-7', up: 'm5 15 7-7 7 7', close: 'm6 6 12 12M6 18 18 6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  copy: 'M8 8h13v13H8zM16 4V2H2v14h2', trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  sparkles: 'm12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3M21 2v4m-2-2h4',
  check: 'm5 12 4 4L19 6', warning: 'M12 3 2 21h20L12 3m0 6v5m0 3v.1',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 5h13M8 12h13M8 19h13M3 5h.1M3 12h.1M3 19h.1',
  undo: 'M3 10h11a7 7 0 0 1 0 14M3 10l5-5m-5 5 5 5',
  image: 'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0',
  film: 'M4 3h16v18H4zM8 3v18M16 3v18M4 8h4M4 13h4M4 18h4M16 8h4M16 13h4M16 18h4',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3M5 11a7 7 0 0 0 14 0M12 18v3',
  play: 'M7 4v16l13-8z', pause: 'M7 4v16M17 4v16', prev: 'M19 5v14L8 12zM5 5v14', next: 'M5 5v14l11-7zM19 5v14',
  volume: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', mute: 'M4 9v6h4l5 4V5L8 9zM22 9l-6 6m0-6 6 6',
  pencil: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  refresh: 'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
  more: 'M5 12h.1M12 12h.1M19 12h.1', key: 'M15 7a4 4 0 1 1-3.9 5H8v3H5v3H2v-3l6.1-6.1A4 4 0 0 1 15 7m1.5 2.5h.1',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0m11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  text: 'M5 6V4h14v2M12 4v16m-3 0h6', bolt: 'M13 2 4 14h7l-1 8 9-12h-7z', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11',
  comment: 'M4 5h16v11H9l-5 4z', share: 'M14 5l6 6-6 6v-4c-6 0-9 2-10 6 0-7 3-10 10-10z',
}

function Icon({ name, size = 18, className, style }) {
  return h('svg', {
    className: cx('db-icon', className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: name === 'more' ? 2.8 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style,
  }, h('path', { d: ICONS[name] || ICONS.brief }))
}

const Spinner = () => h('span', { className: 'db-spin', 'aria-hidden': 'true' })

/** kind: primary | soft | ghost | danger；不传就是描边按钮。 */
function Btn({ kind, size, icon, busy, children, className, ...props }) {
  return h('button', { type: 'button', className: cx('db-btn', kind, size, className), ...props },
    busy ? h(Spinner) : icon ? h(Icon, { name: icon, size: size === 'sm' ? 15 : 17 }) : null,
    children)
}

function IconBtn({ icon, label, className, size, ...props }) {
  return h('button', { type: 'button', className: cx('db-btn icon', size, className), title: label, 'aria-label': label, ...props },
    h(Icon, { name: icon, size: size === 'sm' ? 15 : 17 }))
}

function Field({ label, hint, wide, children }) {
  return h('label', { className: cx('db-field', wide && 'wide') },
    h('span', { className: 'db-label' }, label, hint ? h('em', null, hint) : null),
    children)
}

function Chips({ options, value, onChange, label }) {
  return h('div', { className: 'db-chips', role: 'group', 'aria-label': label }, options.map((option) => h('button', {
    key: option, type: 'button', className: 'db-chip', 'aria-pressed': option === value, onClick: () => onChange(option),
  }, option)))
}

function Segment({ options, value, onChange, label }) {
  return h('div', { className: 'db-seg', role: 'group', 'aria-label': label }, options.map(([id, text, icon]) => h('button', {
    key: id, type: 'button', 'aria-pressed': value === id, onClick: () => onChange(id),
  }, icon ? h(Icon, { name: icon, size: 14 }) : null, text)))
}

/** 状态小标签。tone: ok | warn | info | rec | 空。 */
const Tag = ({ tone, icon, children }) => h('span', { className: cx('db-tag', tone) }, icon ? h(Icon, { name: icon, size: 12 }) : null, children)

/** 环形进度。 */
function Ring({ value, size = 34, stroke = 3.5, children }) {
  const radius = (size - stroke) / 2
  const length = 2 * Math.PI * radius
  const ratio = Math.max(0, Math.min(1, value || 0))
  return h('span', { className: cx('db-ring', ratio >= 1 && 'full'), style: { width: size, height: size } },
    h('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, 'aria-hidden': true },
      h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth: stroke, className: 'track' }),
      h('circle', { cx: size / 2, cy: size / 2, r: radius, fill: 'none', strokeWidth: stroke, className: 'bar', strokeLinecap: 'round', strokeDasharray: length, strokeDashoffset: length * (1 - ratio), transform: `rotate(-90 ${size / 2} ${size / 2})` })),
    children ? h('span', { className: 'db-ring-in' }, children) : null)
}

function Empty({ icon = 'sparkles', title, children, action }) {
  return h('div', { className: 'db-empty' },
    h('span', { className: 'db-empty-mark' }, h(Icon, { name: icon, size: 22 })),
    title ? h('strong', null, title) : null,
    children ? h('p', null, children) : null,
    action || null)
}

/** 运镜方式对应的示意箭头，叠在空画框上，提醒这个镜头会怎么动。 */
const CAMERA_GLYPH = { 固定: '', 推: '⤢', 拉: '⤡', 摇: '⟷', 移: '⟶', 跟: '⤳', 升降: '⭥' }

/**
 * 9:16 画框。所有图像都放在同一种深色「监视器」画框里：
 * 没图时是取景框占位，出图中有扫光，图片到达时有一次「显影」。
 */
function Frame({ asset, video, job, ratio = '9 / 16', shot, index, className, onOpen, fit = 'cover', position, children, emptyLabel }) {
  const src = mediaUrl(asset)
  const previous = useRef(src)
  const [develop, setDevelop] = useState(0)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (src && previous.current !== src) { setDevelop((n) => n + 1); setFailed(false) }
    previous.current = src
  }, [src])
  const active = job && (job.status === 'queued' || job.status === 'running')
  const body = video
    ? h('video', { src: mediaUrl(video), poster: src || undefined, muted: true, loop: true, playsInline: true, preload: 'metadata', onMouseEnter: (e) => e.currentTarget.play().catch(() => {}), onMouseLeave: (e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 } })
    : src && !failed
      ? h('img', { key: `${src}-${develop}`, className: develop ? 'develop' : '', src, alt: shot?.description?.slice(0, 60) || '', loading: 'lazy', draggable: false, style: { objectFit: fit, objectPosition: position }, onError: () => setFailed(true) })
      : h('div', { className: 'db-frame-ph' },
        h('i', { className: 'tl' }), h('i', { className: 'tr' }), h('i', { className: 'bl' }), h('i', { className: 'br' }),
        failed ? h('span', null, '图片文件找不到了') : h('span', null,
          shot ? h('b', null, shot.shotSize) : null,
          shot && CAMERA_GLYPH[shot.camera] ? h('em', null, CAMERA_GLYPH[shot.camera], ' ', shot.camera) : null,
          emptyLabel ? h('small', null, emptyLabel) : null))
  return h('div', { className: cx('db-frame', className, active && 'busy', onOpen && 'clickable'), style: { aspectRatio: ratio }, onClick: onOpen, role: onOpen ? 'button' : undefined, tabIndex: onOpen ? 0 : undefined, onKeyDown: onOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } } : undefined, 'aria-label': onOpen && index !== undefined ? `镜头 ${index + 1}` : undefined },
    body,
    active ? h('div', { className: 'db-frame-gen', role: 'status' },
      h('span', { className: 'db-frame-sweep' }),
      h('span', { className: 'db-frame-gen-text' }, job.status === 'queued' ? '排队中' : job.message || '生成中')) : null,
    children)
}

/** 全屏看图 / 看视频。 */
function Lightbox({ items, start = 0, onClose }) {
  const [index, setIndex] = useState(start)
  const item = items[Math.max(0, Math.min(items.length - 1, index))]
  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setIndex((n) => Math.max(0, n - 1))
      if (event.key === 'ArrowRight') setIndex((n) => Math.min(items.length - 1, n + 1))
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [items.length, onClose])
  if (!item) return null
  const isVideo = item.asset.kind === 'video' || item.asset.kind === 'render'
  return h('div', { className: 'db-lightbox', role: 'dialog', 'aria-modal': true, 'aria-label': '查看素材', onClick: (e) => { if (e.target === e.currentTarget) onClose() } },
    h('div', { className: 'db-lightbox-stage' },
      isVideo
        ? h('video', { key: item.asset.file, src: mediaUrl(item.asset), controls: true, autoPlay: true, playsInline: true })
        : item.asset.kind === 'audio'
          ? h('audio', { key: item.asset.file, src: mediaUrl(item.asset), controls: true, autoPlay: true })
          : h('img', { key: item.asset.file, src: mediaUrl(item.asset), alt: item.title || '' })),
    h('div', { className: 'db-lightbox-bar' },
      h('div', { className: 'db-lightbox-meta' },
        h('strong', null, item.title || '素材'),
        item.note ? h('span', null, item.note) : null),
      items.length > 1 ? h('span', { className: 'db-lightbox-count' }, `${index + 1} / ${items.length}`) : null,
      items.length > 1 ? h(IconBtn, { icon: 'back', label: '上一张', disabled: index === 0, onClick: () => setIndex(index - 1) }) : null,
      items.length > 1 ? h(IconBtn, { icon: 'chevron', label: '下一张', disabled: index === items.length - 1, onClick: () => setIndex(index + 1) }) : null,
      item.actions || null,
      h(IconBtn, { icon: 'download', label: '下载', onClick: () => downloadUrl(mediaUrl(item.asset), `${safeName(item.title || '素材')}.${item.asset.file.split('.').pop()}`) }),
      h(IconBtn, { icon: 'close', label: '关闭', onClick: onClose })))
}

/** 下拉菜单：items 为 [{ label, hint, icon, onClick, disabled, danger }]。 */
function Menu({ button, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false) }
    const key = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
  }, [open])
  return h('span', { className: 'db-menu', ref: box },
    button({ open, toggle: () => setOpen((value) => !value) }),
    open ? h('div', { className: cx('db-menu-pop', align), role: 'menu' }, items.filter(Boolean).map((item) => h('button', {
      key: item.label, type: 'button', role: 'menuitem', className: cx(item.danger && 'danger'), disabled: item.disabled,
      onClick: () => { setOpen(false); item.onClick() },
    }, item.icon ? h(Icon, { name: item.icon, size: 16 }) : null, h('span', null, item.label, item.hint ? h('small', null, item.hint) : null)))) : null)
}

/** 点一下试听的小播放键；同一时间只响一个。 */
let playingAudio = null
function AudioChip({ asset, label = '试听' }) {
  const [playing, setPlaying] = useState(false)
  const audio = useRef(null)
  useEffect(() => () => { audio.current?.pause() }, [])
  useEffect(() => { audio.current?.pause(); audio.current = null; setPlaying(false) }, [asset?.file])
  if (!asset) return null
  const toggle = () => {
    if (playing) { audio.current?.pause(); return }
    playingAudio?.pause()
    const element = audio.current || new Audio(mediaUrl(asset))
    audio.current = element
    playingAudio = element
    element.onended = element.onpause = () => setPlaying(false)
    element.onplay = () => setPlaying(true)
    element.currentTime = 0
    element.play().catch(() => setPlaying(false))
  }
  return h('button', { type: 'button', className: cx('db-audio', playing && 'on'), onClick: toggle, 'aria-label': playing ? '停止' : label },
    h(Icon, { name: playing ? 'pause' : 'play', size: 12 }),
    h('span', { className: 'db-audio-wave', 'aria-hidden': true }, h('i'), h('i'), h('i'), h('i')),
    asset.dur ? h('span', null, `${asset.dur.toFixed(1)} 秒`) : h('span', null, label))
}

/** 选文件按钮（上传图片 / 视频 / 配乐）。 */
function FilePick({ accept, onPick, children, ...props }) {
  const input = useRef(null)
  return h(Fragment, null,
    h('input', { type: 'file', accept, hidden: true, ref: input, onChange: (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onPick(file) } }),
    h(Btn, { ...props, onClick: () => input.current?.click() }, children))
}
