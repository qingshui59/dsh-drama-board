// 发布与素材库。

/** 发布前按平台规则检查一遍。state：ok | warn | bad。 */
function publishChecks(platform, { publish, title, cover, latest }) {
  const checks = []
  const titleText = title.trim()
  if (!latest) {
    checks.push({ state: 'bad', label: '成片', detail: '还没有合成 MP4。发布页只交付成品，先去「成片」页合成。' })
  } else {
    const ratio = latest.w && latest.h ? latest.w / latest.h : 0
    const vertical = Math.abs(ratio - 9 / 16) < 0.02
    checks.push({
      state: vertical ? 'ok' : 'warn',
      label: '画面比例',
      detail: `${latest.w || '?'}×${latest.h || '?'}${vertical ? '，标准竖屏' : '，不是 9:16，平台可能加黑边'}`,
    })
    checks.push({ state: 'ok', label: '时长', detail: clock(latest.dur || 0) })
  }
  checks.push(!titleText
    ? { state: 'bad', label: '标题', detail: '还没有标题，点「AI 写文案」或自己填一个。' }
    : titleText.length > platform.titleMax
      ? { state: 'bad', label: `标题 ${titleText.length}/${platform.titleMax} 字`, detail: `超出 ${titleText.length - platform.titleMax} 字，${platform.name}会截断或拒绝。` }
      : { state: 'ok', label: `标题 ${titleText.length}/${platform.titleMax} 字` })
  if (platform.id === 'shipinhao' && /[^\u4e00-\u9fa5A-Za-z0-9 ]/.test(titleText)) {
    checks.push({ state: 'warn', label: '短标题字符', detail: '视频号的短标题只收中文、字母、数字和空格，标点和表情可能存不进去。' })
  }
  const caption = String(publish.caption || '').trim()
  checks.push(!caption
    ? { state: 'warn', label: '简介', detail: '留空也能发，但少了一次把人留住的机会。' }
    : caption.length > platform.captionMax
      ? { state: 'bad', label: `简介 ${caption.length}/${platform.captionMax} 字`, detail: '超出后平台会截断或拒绝。' }
      : { state: 'ok', label: `简介 ${caption.length}/${platform.captionMax} 字` })
  const tagCount = publish.tags.length
  checks.push(tagCount === 0
    ? { state: 'warn', label: '话题标签', detail: '一个都没有，推荐页很难把你分到对的池子里。' }
    : tagCount > platform.tagMax
      ? { state: 'warn', label: `话题 ${tagCount}/${platform.tagMax} 个`, detail: `超出 ${tagCount - platform.tagMax} 个，只带前 ${platform.tagMax} 个就好。` }
      : { state: 'ok', label: `话题 ${tagCount}/${platform.tagMax} 个` })
  checks.push(cover
    ? { state: 'ok', label: '封面', detail: platform.coverAspect === '16:9' ? '已选关键帧；B站按 16:9 显示，9:16 的画面会被裁切。' : '已选关键帧。' }
    : { state: 'warn', label: '封面', detail: '没选封面，平台会自己截第一帧。' })
  if (publish.coverText && publish.coverText.length > 10) {
    checks.push({ state: 'warn', label: `封面大字 ${publish.coverText.length}/10 字`, detail: '太长了，手机上会糊成一片。' })
  }
  return checks
}

function PublishPage() {
  const studio = useStudio()
  const { project, episodeIndex, patch, busy, generate, navigate } = studio
  const episode = project.episodes.find((e) => e.index === episodeIndex)
  const shots = shotsOf(project, episodeIndex)
  if (!episode) return h('div', { className: 'db-stack' }, h(EpisodeTabs), h(Empty, { icon: 'publish', title: '还没有这一集' }, '先在分集页写好故事。'))
  const publish = episode.publish
  const platform = platformOf(publish.platform)
  const withImage = shots.filter((shot) => shot.image)
  const cover = withImage.find((shot) => shot.id === episode.cover) || withImage[0] || null
  const title = publish.titles[publish.pick] || publish.titles[0] || ''
  // B站的话题是独立标签框，粘贴时不用带 #；其余三家写在描述里，要 # 才会变话题。
  const tags = platform.id === 'bilibili' ? publish.tags.join(' ') : publish.tags.map((tag) => `#${tag}`).join(' ')
  const latest = episode.renders[0] || null
  const setPublish = (mutate) => patch((draft) => { const target = draft.episodes.find((e) => e.id === episode.id); if (target) mutate(target.publish, target) })
  const fullText = [title, '', publish.caption, '', tags].join('\n').trim()
  const checks = publishChecks(platform, { publish, title, cover, latest })
  const blocking = checks.filter((item) => item.state === 'bad')
  const titleLabel = platform.id === 'shipinhao' ? '短标题' : '标题'

  return h('div', { className: 'db-stack' },
    h(EpisodeTabs),
    h('section', { className: 'db-card' },
      h('header', { className: 'db-section-head' },
        h('h2', null, '发布到哪个平台'),
        h('span', { className: 'db-muted' }, '四家的接口开放程度不同，选中后按它的规矩检查文案')),
      h('div', { className: 'db-platforms', role: 'group', 'aria-label': '发布平台' },
        PLATFORMS.map((item) => h('button', {
          key: item.id, type: 'button', className: cx('db-platform', item.id === platform.id && 'on'),
          'aria-pressed': item.id === platform.id, style: { '--platform-color': item.color },
          onClick: () => setPublish((target) => { target.platform = item.id }),
        },
          h('span', { className: 'db-platform-badge', 'aria-hidden': true }, item.short),
          h('span', { className: 'db-platform-text' },
            h('strong', null, item.name),
            h('small', null, item.api === 'open' ? '有官方接口' : '无发布接口')),
          item.id === platform.id ? h(Icon, { name: 'check', size: 15, className: 'db-platform-check' }) : null))),
      h('div', { className: 'db-platform-detail' },
        h('p', null, platform.apiDetail,
          h('a', { className: 'db-link', href: platform.doc, target: '_blank', rel: 'noreferrer noopener' }, '接口文档')),
        h('ul', { className: 'db-platform-limits' }, platform.limits.map((line) => h('li', { key: line }, line))),
        h('p', { className: 'db-muted' }, platform.api === 'open'
          ? '接口还没接进工作台（要开放平台应用凭证 + 账号授权）。现在用「复制发布包 → 打开创作中心 → 上传成片」，一分钟能发完。'
          : '视频号没有对外接口，只能手动：打开助手 → 上传成片 → 粘贴文案。'))),

    h('div', { className: 'db-publish' },
      h('div', { className: 'db-phone' },
        h('div', { className: 'db-phone-screen' },
          cover ? h('img', { src: mediaUrl(cover.image), alt: '封面' }) : h('div', { className: 'db-frame-ph' }, h('span', null, h('small', null, '出图后可以选封面'))),
          publish.coverText ? h('div', { className: 'db-phone-cover-text' }, publish.coverText) : null,
          latest ? h('button', { type: 'button', className: 'db-phone-play', 'aria-label': '播放成片', onClick: () => studio.setLightbox({ items: [{ asset: latest, title: `${project.name} 第${episodeIndex}集`, note: `${latest.w}×${latest.h}` }] }) }, h(Icon, { name: 'play', size: 26 })) : null,
          h('div', { className: 'db-phone-rail', 'aria-hidden': true }, h(Icon, { name: 'heart', size: 22 }), h(Icon, { name: 'comment', size: 22 }), h(Icon, { name: 'share', size: 22 })),
          h('div', { className: 'db-phone-caption', 'aria-hidden': true },
            h('strong', null, `@${project.name.slice(0, 12)}`),
            h('p', null, title || '这里显示你选的标题'),
            tags ? h('span', null, tags) : null)),
        h('p', { className: 'db-muted' }, `${platform.name}里的样子。点播放键看成片。`)),

      h('div', { className: 'db-stack' },
        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '发布检查'), h(Tag, { tone: blocking.length ? 'warn' : 'ok', icon: blocking.length ? 'warning' : 'check' }, blocking.length ? `${blocking.length} 项要改` : '可以发')),
          h('ul', { className: 'db-checks' }, checks.map((item, i) => h('li', { key: `${item.label}-${i}`, className: cx('db-check', item.state) },
            h(Icon, { name: item.state === 'ok' ? 'check' : 'warning', size: 15 }),
            h('div', null, h('span', null, item.label), item.detail ? h('small', null, item.detail) : null)))),
          h('div', { className: 'db-row' },
            h('a', { className: 'db-btn primary db-link-btn', href: platform.studio, target: '_blank', rel: 'noreferrer noopener' }, h(Icon, { name: 'link', size: 17 }), `打开${platform.studioName}`),
            h(Btn, { icon: 'copy', disabled: !fullText, onClick: () => studio.copy(fullText, `${platform.name}发布包`) }, '复制发布包'))),

        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '发布文案'),
            h(Btn, { kind: publish.titles.length ? undefined : 'primary', size: 'sm', icon: 'sparkles', busy: busy === 'publish', disabled: Boolean(busy), onClick: () => generate('publish') }, busy === 'publish' ? '生成中' : publish.titles.length ? '重新生成' : 'AI 写文案')),
          publish.titles.length === 0 && !publish.caption
            ? h('p', { className: 'db-note' }, '按这一集的钩子和卡点写 3 个候选标题、一段简介和 5 个话题标签。也可以直接在下面手写。')
            : null,
          h('div', { className: 'db-field' },
            h('span', { className: 'db-label' }, titleLabel, h('em', null, platform.titleHint)),
            h('div', { className: 'db-titles' },
              (publish.titles.length ? publish.titles : ['']).map((text, i) => h('label', { key: i, className: cx('db-title-option', publish.pick === i && 'on') },
                h('input', { type: 'radio', name: `title-${episode.id}`, checked: publish.pick === i, onChange: () => setPublish((target) => { target.pick = i }) }),
                h('input', { className: 'db-input db-input-bare', value: text, placeholder: '写一个带悬念的标题', 'aria-label': `候选标题 ${i + 1}`, onChange: (e) => setPublish((target) => { const list = target.titles.length ? target.titles : ['']; list[i] = e.target.value; target.titles = list }) }),
                h('span', { className: cx('db-count', text.length > platform.titleMax && 'over') }, `${text.length}/${platform.titleMax}`))),
              publish.titles.length < 5 ? h(Btn, { kind: 'ghost', size: 'sm', icon: 'plus', onClick: () => setPublish((target) => { target.titles = [...(target.titles.length ? target.titles : ['']), ''] }) }, '再加一个') : null)),
          h(Field, { label: '简介', hint: `不超过 ${platform.captionMax} 字` }, h('textarea', { className: 'db-textarea', rows: 3, value: publish.caption, placeholder: '一两句话勾起好奇，结尾留一个让人想评论的问题', onChange: (e) => setPublish((target) => { target.caption = e.target.value }) })),
          h(Field, { label: '话题标签', hint: `用空格分开，不用写 #；${platform.name}最多 ${platform.tagMax} 个` }, h('input', { className: 'db-input', value: publish.tags.join(' '), placeholder: 'AI短剧 悬疑 反转', onChange: (e) => setPublish((target) => { target.tags = e.target.value.split(/[\s,，#]+/).filter(Boolean).slice(0, 8) }) })),
          h(Field, { label: '封面大字', hint: '不超过 10 个字' }, h('input', { className: 'db-input', value: publish.coverText, onChange: (e) => setPublish((target) => { target.coverText = e.target.value }) })),
          h('div', { className: 'db-row' },
            h(Btn, { kind: 'primary', icon: 'copy', disabled: !fullText, onClick: () => studio.copy(fullText, '标题、简介和标签') }, '复制全部文案'),
            h(Btn, { icon: 'copy', disabled: !title, onClick: () => studio.copy(title, '标题') }, '只复制标题'))),

        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '封面'), h('span', { className: 'db-muted' }, withImage.length ? (platform.coverAspect === '16:9' ? `B站按 ${platform.coverAspect} 显示，竖屏关键帧会被裁切` : '点一张关键帧作为封面') : '这一集还没有关键帧')),
          withImage.length ? h('div', { className: 'db-strip pick' }, withImage.map((shot) => h('button', {
            key: shot.id, type: 'button', className: 'db-cover-option', 'aria-pressed': cover?.id === shot.id, 'aria-label': '设为封面',
            onClick: () => setPublish((_, target) => { target.cover = shot.id }),
          }, h('img', { src: mediaUrl(shot.image), alt: '', loading: 'lazy' })))) : h(Btn, { icon: 'board', onClick: () => navigate('board', episodeIndex) }, '去分镜页出图'),
          cover ? h('div', { className: 'db-row' }, h(Btn, { size: 'sm', icon: 'download', onClick: () => downloadUrl(mediaUrl(cover.image), `${safeName(project.name)}-第${episodeIndex}集-封面.${cover.image.file.split('.').pop()}`) }, '下载封面图')) : null),

        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '交付文件'), h('span', { className: 'db-muted' }, `${platform.name}要的竖屏成片`)),
          h('div', { className: 'db-deliver' },
            h('div', null, h('strong', null, '成片 MP4'), h('span', { className: 'db-muted' }, latest ? `${latest.w}×${latest.h}，${clock(latest.dur || 0)}` : '还没有合成')),
            latest ? h(Btn, { size: 'sm', kind: 'primary', icon: 'download', onClick: () => downloadUrl(mediaUrl(latest), `${safeName(project.name)}-第${episodeIndex}集.mp4`) }, '下载') : h(Btn, { size: 'sm', icon: 'studio', onClick: () => navigate('studio', episodeIndex) }, '去合成')),
          h('div', { className: 'db-deliver' },
            h('div', null, h('strong', null, '分镜表'), h('span', { className: 'db-muted' }, `${shots.length} 个镜头，含完整提示词`)),
            h('div', { className: 'db-row tight' },
              h(Btn, { size: 'sm', disabled: !shots.length, onClick: () => download(`${safeName(project.name)}-第${episodeIndex}集.md`, toMarkdown(project, episodeIndex, shots), 'text/markdown;charset=utf-8') }, 'Markdown'),
              h(Btn, { size: 'sm', disabled: !shots.length, onClick: () => download(`${safeName(project.name)}-第${episodeIndex}集.csv`, toCsv(project, episodeIndex, shots), 'text/csv;charset=utf-8') }, 'CSV'))),
          h('div', { className: 'db-deliver' },
            h('div', null, h('strong', null, '项目备份'), h('span', { className: 'db-muted' }, '全部文字与素材引用（JSON）')),
            h(Btn, { size: 'sm', onClick: studio.backupProject }, '导出'))))))
}

const KIND_NAME = { image: '图片', video: '视频', audio: '配音', render: '成片' }

function LibraryPage() {
  const studio = useStudio()
  const { project, toast } = studio
  const [assets, setAssets] = useState(null)
  const [filter, setFilter] = useState('all')
  const [reload, setReload] = useState(0)

  // 这个项目用到的素材可能来自别的项目目录（副本、导入），一并列出。
  const pids = useMemo(() => {
    const set = new Set([project.id])
    const visit = (ref) => { if (ref?.pid) set.add(ref.pid) }
    project.characters.forEach((c) => { visit(c.portrait); c.portraits.forEach(visit) })
    project.episodes.forEach((e) => { e.renders.forEach(visit); visit(e.bgm) })
    Object.values(project.boards).flat().forEach((shot) => { visit(shot.image); shot.images.forEach(visit); visit(shot.video); visit(shot.audio) })
    return Array.from(set)
  }, [project])
  const inUse = useMemo(() => {
    const set = new Set()
    const visit = (ref) => { if (ref?.file) set.add(ref.file) }
    project.characters.forEach((c) => visit(c.portrait))
    project.episodes.forEach((e) => { visit(e.renders[0]); visit(e.bgm) })
    Object.values(project.boards).flat().forEach((shot) => { visit(shot.image); visit(shot.video); visit(shot.audio) })
    return set
  }, [project])
  const jobCount = studio.jobs.length

  useEffect(() => {
    let alive = true
    request(`assets?pids=${pids.join(',')}`).then((payload) => { if (alive) setAssets(payload.assets.map((item) => ({ ...item, ref: normalizeRef(item) })).filter((item) => item.ref)) }).catch((error) => { if (alive) { setAssets([]); toast('err', `读取素材失败：${error.message}`) } })
    return () => { alive = false }
  }, [pids.join(','), reload, jobCount])

  const list = (assets || []).filter((item) => filter === 'all' || item.kind === filter)
  const counts = (assets || []).reduce((map, item) => ({ ...map, [item.kind]: (map[item.kind] || 0) + 1 }), {})
  const bytes = (assets || []).reduce((sum, item) => sum + (item.bytes || 0), 0)
  const remove = async (item) => {
    if (inUse.has(item.file)) { toast('info', '这个素材正在被镜头或角色使用。先在分镜或角色页换掉它，再来删除。'); return }
    if (!await studio.ask('删除这个素材？', '文件会从本机素材目录里删除，无法恢复。', '删除素材', { danger: true })) return
    try {
      await request('media/delete', { pid: item.pid, file: item.file })
      studio.patch((draft) => {
        draft.characters.forEach((c) => { c.portraits = c.portraits.filter((ref) => ref.file !== item.file) })
        draft.episodes.forEach((e) => { e.renders = e.renders.filter((ref) => ref.file !== item.file) })
        Object.values(draft.boards).flat().forEach((shot) => { shot.images = shot.images.filter((ref) => ref.file !== item.file) })
      })
      setReload((n) => n + 1)
    } catch (error) {
      toast('err', `删除失败：${error.message}`)
    }
  }
  const open = (item) => {
    const visual = list.filter((entry) => entry.kind !== 'audio')
    if (item.kind === 'audio') { studio.setLightbox({ items: [{ asset: item.ref, title: item.prompt || '配音', note: item.provider }] }); return }
    studio.setLightbox({
      items: visual.map((entry) => ({ asset: entry.ref, title: entry.target?.kind === 'character' ? '定妆照' : KIND_NAME[entry.kind], note: [entry.source === 'sketch' ? '本地草图' : entry.source === 'upload' ? '上传' : entry.provider, entry.model].filter(Boolean).join(' / ') })),
      start: visual.indexOf(item),
    })
  }

  return h('div', { className: 'db-stack' },
    h('div', { className: 'db-toolbar' },
      h(Segment, { label: '素材类型', value: filter, onChange: setFilter, options: [['all', `全部 ${assets?.length ?? ''}`], ['image', `图片 ${counts.image || 0}`], ['video', `视频 ${counts.video || 0}`], ['audio', `配音 ${counts.audio || 0}`], ['render', `成片 ${counts.render || 0}`]] }),
      h('span', { className: 'db-grow' }),
      h('span', { className: 'db-muted' }, assets ? `占用 ${(bytes / 1024 / 1024).toFixed(1)} MB` : '读取中'),
      h(IconBtn, { icon: 'refresh', label: '刷新素材列表', className: 'ghost', onClick: () => setReload((n) => n + 1) })),
    assets && list.length === 0
      ? h(Empty, { icon: 'library', title: '这里还没有素材' }, '出图、配音、图生视频和合成的结果都会自动收进素材库，旧版本也在这里。')
      : h('div', { className: 'db-library' }, list.map((item) => h('figure', { key: `${item.pid}/${item.file}`, className: cx('db-asset', item.kind) },
        item.kind === 'audio'
          ? h('div', { className: 'db-asset-audio' }, h(AudioChip, { asset: item.ref }), h('p', null, item.prompt || '配音'))
          : h(Frame, { asset: item.kind === 'image' ? item.ref : null, video: item.kind !== 'image' ? item.ref : null, onOpen: () => open(item) }),
        h('figcaption', null,
          h('span', null, item.target?.kind === 'character' ? '定妆照' : KIND_NAME[item.kind], inUse.has(item.file) ? h(Tag, { tone: 'ok' }, '使用中') : null),
          h('small', null, item.source === 'sketch' ? '本地草图' : item.source === 'upload' ? '上传' : item.provider || '本机'),
          h('div', { className: 'db-asset-actions' },
            item.prompt && item.kind !== 'audio' ? h(IconBtn, { icon: 'copy', size: 'sm', className: 'ghost', label: '复制提示词', onClick: () => studio.copy(item.prompt, '提示词') }) : null,
            h(IconBtn, { icon: 'download', size: 'sm', className: 'ghost', label: '下载', onClick: () => downloadUrl(mediaUrl(item.ref), item.file) }),
            h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '删除素材', onClick: () => remove(item) })))))))
}
