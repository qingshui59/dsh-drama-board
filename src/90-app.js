// 外壳：侧栏、顶栏、任务面板、弹窗，以及向 Harness 注册插件。

const PAGES = [
  { id: 'overview', title: '总览', icon: 'home', hint: '这部剧做到哪一步了', group: 'flow' },
  { id: 'brief', title: '立项', icon: 'brief', hint: '一句话定下故事和画面风格', group: 'flow' },
  { id: 'cast', title: '角色', icon: 'cast', hint: '固定外貌、定妆照和音色，让人物始终是同一个人', group: 'flow' },
  { id: 'episodes', title: '分集', icon: 'episodes', hint: '每一集的钩子、冲突和卡点', group: 'flow' },
  { id: 'board', title: '分镜', icon: 'board', hint: '把一集拆成镜头，给每个镜头出图', group: 'flow' },
  { id: 'studio', title: '成片', icon: 'studio', hint: '试映、配音，合成可以发布的 MP4', group: 'flow' },
  { id: 'publish', title: '发布', icon: 'publish', hint: '选平台、写文案、导出发布包', group: 'flow' },
  { id: 'library', title: '素材库', icon: 'library', hint: '这个项目生成过的所有图片、视频、配音和成片', group: 'tool' },
  { id: 'engine', title: '生成引擎', icon: 'engine', hint: '选择出图、视频、配音用哪一家', group: 'tool' },
]

const JOB_ICON = { image: 'image', video: 'film', tts: 'mic', render: 'studio' }

function JobsButton() {
  const { jobs, cancelJobs, dismissJobs } = useStudio()
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const active = jobs.filter(isActive)
  const failed = jobs.filter((job) => job.status === 'error')
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (!box.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  if (!jobs.length) return null
  const overall = active.length ? active.reduce((sum, job) => sum + (job.progress || 0), 0) / active.length : 1
  return h('span', { className: 'db-jobs', ref: box },
    h('button', { type: 'button', className: cx('db-jobs-btn', active.length && 'busy', failed.length && 'err'), onClick: () => setOpen(!open), 'aria-expanded': open, 'aria-label': `后台任务，${active.length} 个进行中` },
      active.length ? h(Ring, { value: overall, size: 22, stroke: 3 }) : h(Icon, { name: failed.length ? 'warning' : 'check', size: 16 }),
      active.length ? `${active.length} 个任务` : failed.length ? `${failed.length} 个失败` : '任务'),
    open ? h('div', { className: 'db-jobs-pop', role: 'dialog', 'aria-label': '后台任务' },
      h('header', null, h('strong', null, '后台任务'),
        active.length > 1 ? h(Btn, { kind: 'ghost', size: 'sm', onClick: () => cancelJobs(active.map((job) => job.id)) }, '全部取消') : null,
        failed.length ? h(Btn, { kind: 'ghost', size: 'sm', onClick: () => dismissJobs(failed.map((job) => job.id)) }, '清除失败记录') : null),
      h('ul', null, jobs.slice().reverse().map((job) => h('li', { key: job.id, className: job.status },
        h(Icon, { name: JOB_ICON[job.type] || 'sparkles', size: 16 }),
        h('div', null,
          h('strong', null, job.label || job.type),
          job.status === 'error' ? h('p', null, job.error) : h('span', { className: 'db-muted' }, job.status === 'queued' ? '排队中' : job.message),
          isActive(job) ? h('div', { className: 'db-bar' }, h('span', { style: { width: `${Math.round((job.progress || 0) * 100)}%` } })) : null),
        isActive(job)
          ? h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '取消任务', onClick: () => cancelJobs([job.id]) })
          : h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '清除记录', onClick: () => dismissJobs([job.id]) }))))) : null)
}

function Dialog() {
  const { dialog, answer } = useStudio()
  useEffect(() => {
    if (!dialog) return undefined
    const handler = (event) => {
      if (event.key === 'Escape') answer(false)
      if (event.key === 'Tab') {
        const controls = Array.from(document.querySelectorAll('.db-modal button'))
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    const previous = document.activeElement
    const timer = setTimeout(() => document.querySelector('.db-modal .db-btn.primary, .db-modal .db-btn.danger')?.focus(), 0)
    document.addEventListener('keydown', handler)
    return () => { clearTimeout(timer); document.removeEventListener('keydown', handler); previous?.focus?.() }
  }, [dialog, answer])
  if (!dialog) return null
  return h('div', { className: 'db-modal-backdrop', onClick: (e) => { if (e.target === e.currentTarget) answer(false) } },
    h('section', { className: 'db-modal', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'db-dialog-title', 'aria-describedby': 'db-dialog-text' },
      h('h2', { id: 'db-dialog-title' }, dialog.title),
      h('p', { id: 'db-dialog-text' }, dialog.text),
      h('div', { className: 'db-row end' },
        h(Btn, { onClick: () => answer(false) }, '取消'),
        dialog.alt ? h(Btn, { onClick: () => answer('alt') }, dialog.alt) : null,
        h(Btn, { kind: dialog.danger ? 'danger' : 'primary', onClick: () => answer(true) }, dialog.action))))
}

function Toasts() {
  const { toasts, dismissToast } = useStudio()
  return h('div', { className: 'db-toasts', 'aria-live': 'polite' }, toasts.map((item) => h('div', { key: item.id, className: cx('db-toast', item.tone), role: item.tone === 'err' ? 'alert' : 'status' },
    h(Icon, { name: item.tone === 'err' ? 'warning' : item.tone === 'ok' ? 'check' : 'sparkles', size: 16 }),
    h('span', null, item.text),
    h('button', { type: 'button', onClick: () => dismissToast(item.id), 'aria-label': '关闭提示' }, h(Icon, { name: 'close', size: 14 })))))
}

const BUSY_TEXT = { outline: '正在写剧本大纲', characters: '正在设计角色', episodes: '正在写分集', storyboard: '正在拆分镜', publish: '正在写发布文案' }

function Shell() {
  const studio = useStudio()
  const { store, project, tab, navigate, busy, elapsed, theme, setTheme, model, jobs } = studio
  const [search, setSearch] = useState('')
  const importInput = useRef(null)
  const pageBox = useRef(null)
  // 文本生成期间整页不可操作（避免生成结果盖掉刚敲的字）。用 DOM 属性设置，兼容不同版本的 React。
  const locked = Boolean(busy) && tab !== 'engine'
  useEffect(() => { if (pageBox.current) pageBox.current.inert = locked })
  const page = PAGES.find((item) => item.id === tab) || PAGES[0]
  const projects = store.projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  const badge = (id) => {
    if (!project) return null
    if (id === 'cast') return project.characters.length || null
    if (id === 'episodes') return project.episodes.length || null
    if (id === 'board') { const shots = Object.values(project.boards).flat(); return shots.length ? `${shots.filter((shot) => shot.image).length}/${shots.length}` : null }
    if (id === 'studio') { const done = project.episodes.filter((e) => e.renders.length).length; return done ? `${done} 集` : null }
    return null
  }
  const renderPage = () => {
    if (tab === 'engine') return h(EnginePage)
    if (!project) {
      return h(Empty, { icon: 'board', title: '把下一个故事拍出来', action: h('div', { className: 'db-row' }, h(Btn, { kind: 'primary', icon: 'plus', onClick: studio.createProject }, '新建短剧'), h(Btn, { icon: 'upload', onClick: () => importInput.current?.click() }, '导入备份')) },
        '从一句话梗概开始，依次完成角色、分集、分镜、出图、配音，最后合成一条可以发布的竖屏视频。')
    }
    if (tab === 'brief') return h(BriefPage)
    if (tab === 'cast') return h(CastPage)
    if (tab === 'episodes') return h(EpisodesPage)
    if (tab === 'board') return h(BoardPage)
    if (tab === 'studio') return h(StudioPage)
    if (tab === 'publish') return h(PublishPage)
    if (tab === 'library') return h(LibraryPage)
    return h(OverviewPage)
  }
  const navButton = (item) => h('button', {
    key: item.id, type: 'button', 'aria-current': tab === item.id ? 'page' : undefined, onClick: () => navigate(item.id),
  }, h(Icon, { name: item.icon, size: 18 }), h('span', null, item.title), badge(item.id) ? h('small', null, badge(item.id)) : null)

  return h('div', { className: 'db-root', 'data-theme': theme },
    h('aside', { className: 'db-side', 'aria-label': '工作台导航' },
      h('div', { className: 'db-brand' }, h('span', { className: 'db-brand-mark', 'aria-hidden': true }, h('i'), h('i')), h('div', null, h('strong', null, '映序'), h('small', null, 'AI 短剧工作台'))),
      h('nav', { className: 'db-nav', 'aria-label': '制作流程' }, PAGES.filter((item) => item.group === 'flow').map(navButton)),
      h('nav', { className: 'db-nav tools', 'aria-label': '工具' }, PAGES.filter((item) => item.group === 'tool').map(navButton)),
      h('div', { className: 'db-side-projects' },
        h('div', { className: 'db-side-label' }, h('span', null, `项目 ${store.projects.length}`), h(IconBtn, { icon: 'plus', size: 'sm', className: 'ghost', label: '新建短剧', disabled: Boolean(busy), onClick: studio.createProject })),
        store.projects.length > 4 ? h('label', { className: 'db-search' }, h(Icon, { name: 'search', size: 14 }), h('input', { value: search, onChange: (e) => setSearch(e.target.value), placeholder: '搜索项目', 'aria-label': '搜索项目' })) : null,
        h('div', { className: 'db-project-list' }, projects.map((item) => {
          const poster = posterOf(item)
          return h('button', { key: item.id, type: 'button', className: 'db-project', 'aria-current': item.id === store.activeId ? 'true' : undefined, disabled: Boolean(busy), title: item.name, onClick: () => { studio.switchProject(item.id); if (tab === 'engine') navigate('overview') } },
            poster ? h('img', { src: mediaUrl(poster), alt: '', loading: 'lazy' }) : h('i', null, item.name.slice(0, 1)),
            h('span', null, item.name))
        }))),
      h('button', { type: 'button', className: 'db-model', onClick: () => navigate('engine'), title: '打开生成引擎' },
        h('span', { className: cx('db-dot', busy || jobs.some(isActive) ? 'part' : model ? 'ok' : '') }),
        h('span', null, model ? model.model : '文本模型未连接'),
        h(Icon, { name: 'engine', size: 15 }))),

    h('div', { className: 'db-main' },
      h('header', { className: 'db-top' },
        h('div', { className: 'db-top-title' }, h('h1', null, page.title), h('p', null, project && tab !== 'engine' ? project.name : page.hint)),
        h('span', { className: 'db-grow' }),
        h(JobsButton),
        h('span', { className: cx('db-save', studio.saveError && 'err'), role: 'status' }, h(Icon, { name: studio.saveError ? 'warning' : studio.saving ? 'clock' : 'check', size: 14 }), studio.saveError ? '未保存' : studio.saving ? '保存中' : '已保存'),
        studio.saveError ? h(Btn, { size: 'sm', onClick: studio.retry }, '重试') : null,
        studio.undoStore ? h(IconBtn, { icon: 'undo', className: 'ghost', label: '撤销上次操作', disabled: Boolean(busy), onClick: studio.undo }) : null,
        h(Menu, {
          button: ({ toggle }) => h(IconBtn, { icon: 'more', className: 'ghost', label: '项目菜单', onClick: toggle }),
          items: [
            ...store.projects.filter((item) => item.id !== store.activeId).slice(0, 6).map((item) => ({ label: `切换到「${item.name.slice(0, 14)}」`, icon: 'film', disabled: Boolean(busy), onClick: () => { studio.switchProject(item.id); if (tab === 'engine') navigate('overview') } })),
            { label: '新建短剧', icon: 'plus', disabled: Boolean(busy), onClick: studio.createProject },
            { label: '导入备份', icon: 'upload', disabled: Boolean(busy), onClick: () => importInput.current?.click() },
            project ? { label: '导出备份', icon: 'download', onClick: studio.backupProject } : null,
            project ? { label: '创建副本', icon: 'copy', onClick: studio.duplicateProject } : null,
            project ? { label: '删除项目', icon: 'trash', danger: true, disabled: Boolean(busy), onClick: studio.deleteProject } : null,
          ],
        }),
        h(IconBtn, { icon: theme === 'light' ? 'moon' : 'sun', className: 'ghost', label: theme === 'light' ? '切换深色外观' : '切换浅色外观', onClick: () => setTheme(theme === 'light' ? 'dark' : 'light') })),
      h('input', { type: 'file', accept: '.json,application/json', ref: importInput, hidden: true, onChange: (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) studio.importBackup(file) } }),
      studio.engine?.error ? h('div', { className: 'db-busy warn', role: 'alert' }, h(Icon, { name: 'warning', size: 16 }), h('span', null, `出图、配音和合成暂时不可用：${studio.engine.error}`), h(Btn, { size: 'sm', kind: 'ghost', onClick: studio.reloadEngine }, '重试')) : null,
      busy ? h('div', { className: 'db-busy', role: 'status' }, h(Spinner), h('span', null, `${BUSY_TEXT[busy] || 'AI 正在创作'}，已等待 ${elapsed} 秒。通常需要 20~40 秒，完成后自动填入。`), h(Btn, { size: 'sm', kind: 'ghost', onClick: studio.cancelGenerate }, '取消')) : null,
      h('main', { className: cx('db-scroll', tab === 'board' && project && 'fill') },
        h('div', { className: cx('db-page', `page-${tab}`, locked && 'locked'), ref: pageBox, key: `${project?.id || 'none'}-${tab}` }, renderPage()))),

    h(Dialog),
    h(Toasts),
    studio.lightbox ? h(Lightbox, { items: studio.lightbox.items, start: studio.lightbox.start || 0, onClose: () => studio.setLightbox(null) }) : null)
}

function DramaBoardPage() {
  const studio = useStudioState()
  if (!studio.loaded) {
    return h('div', { className: 'db-root', 'data-theme': studio.theme }, h('div', { className: 'db-boot' },
      studio.loadError
        ? h(Empty, { icon: 'warning', title: '暂时无法读取项目', action: h(Btn, { kind: 'primary', onClick: () => window.location.reload() }, '重新读取') }, `${studio.loadError}。为避免覆盖还没读到的项目，现在不能编辑。`)
        : h(Fragment, null, h('div', { className: 'db-skel' }), h('div', { className: 'db-skel tall' }))))
  }
  return h(StudioContext.Provider, { value: studio }, h(Shell))
}

function DramaIcon({ size, active }) {
  return h(Icon, { name: 'studio', size: Number(size) || 20, style: { opacity: active ? 1 : 0.82, color: active ? '#0a7cff' : 'currentColor' } })
}

function ensureStyle() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('style[data-plugin="dsh-drama-board"]').forEach((tag) => tag.remove())
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-drama-board'
  tag.dataset.version = VERSION
  tag.textContent = CSS
  document.head.appendChild(tag)
}

const LOCALE = { zh: { title: 'AI短剧工作台' }, en: { title: 'AI drama studio' } }

const plugin = {
  inject: ['slots', 'locale'],
  apply(ctx) {
    ensureStyle()
    let translate = (key) => LOCALE.zh[key] || key
    try {
      ctx.effect(() => ctx.locale.register('drama-board', LOCALE), 'drama-board: locale')
      const bound = ctx.locale.bind('drama-board')
      translate = (key) => {
        try {
          const value = bound(key)
          if (typeof value === 'string' && value && value !== key) return value
        } catch { /* 退回内置文案 */ }
        return LOCALE.zh[key] || key
      }
    } catch { /* 没有 locale 服务时用内置中文 */ }

    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: 'drama-board', order: 20, label: () => translate('title'),
    }, DramaIcon))

    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'drama-board' }, DramaBoardPage))
  },
}
