// 分镜：画格墙 + 镜头检查器。每个镜头的文字、画面、配音、视频都在这里。

function EpisodeTabs({ extra }) {
  const { project, episodeIndex, setEpisodeIndex, setSelectedShot } = useStudio()
  const count = Math.max(project.episodes.length, 1)
  return h('div', { className: 'db-ep-tabs', role: 'tablist', 'aria-label': '选择分集' },
    Array.from({ length: count }, (_, i) => {
      const episode = project.episodes[i]
      const index = i + 1
      const progress = episodeProgress(project, index)
      return h('button', {
        key: index, type: 'button', role: 'tab', 'aria-selected': episodeIndex === index,
        onClick: () => { setEpisodeIndex(index); setSelectedShot(null) },
      },
        h('span', { className: 'db-ep-num' }, pad2(index)),
        h('span', { className: 'db-ep-tab-title' }, episode?.title?.replace(/^第\s*\d+\s*集[：:\s]*/, '') || `第${index}集`),
        progress.shots ? h('i', { className: cx('db-dot', progress.render ? 'rec' : progress.images === progress.shots ? 'ok' : progress.images ? 'part' : '') }) : null)
    }),
    extra || null)
}

function ShotTile({ shot, index, selected, onSelect }) {
  const studio = useStudio()
  const job = studio.jobFor({ shotId: shot.id, field: 'image' }) || studio.jobFor({ shotId: shot.id, field: 'video' })
  const spoken = parseDialogue(shot.dialogue)
  return h('article', { className: cx('db-tile', selected && 'selected') },
    h(Frame, { asset: shot.image, video: shot.video, shot, index, job, onOpen: onSelect },
      h('div', { className: 'db-slate' }, h('b', null, pad2(index + 1)), h('span', null, shot.shotSize), h('span', null, shot.camera)),
      h('div', { className: 'db-tile-foot' },
        shot.video ? h('i', { title: '已有视频' }, h(Icon, { name: 'film', size: 12 })) : null,
        shot.audio ? h('i', { title: '已配音' }, h(Icon, { name: 'mic', size: 12 })) : spoken ? h('i', { className: 'todo', title: '有台词，还没配音' }, h(Icon, { name: 'mic', size: 12 })) : null,
        h('span', { className: 'db-grow' }),
        h('time', null, `${shot.duration}s`))),
    h('p', { className: 'db-tile-text' }, shot.description || '还没有画面描述'),
    spoken ? h('p', { className: 'db-tile-line' }, spoken.speaker ? `${spoken.speaker}：` : '', spoken.line) : null)
}

function ShotInspector({ shot, index, total, onClose }) {
  const studio = useStudio()
  const { project, episodeIndex, patch, patchShot, toast, jobFor } = studio
  const [showFinal, setShowFinal] = useState(false)
  const composed = composeImagePrompt(project, shot)
  const spoken = parseDialogue(shot.dialogue)
  const imageJob = jobFor({ shotId: shot.id, field: 'image' })
  const audioJob = jobFor({ shotId: shot.id, field: 'audio' })
  const videoJob = jobFor({ shotId: shot.id, field: 'video' })
  const stale = shot.audio && spoken && shot.audioText && shot.audioText !== spoken.line
  const set = (field) => (event) => patchShot(shot.id, (target) => { target[field] = event.target.value })
  const mutateList = (fn) => patch((draft) => { fn(draft.boards[String(episodeIndex)]) })
  const upload = async (file) => {
    try {
      const asset = await uploadMedia(project.id, file, { name: `第${episodeIndex}集 镜头${index + 1}`, target: { kind: 'shot', shotId: shot.id } })
      if (asset.kind === 'audio') studio.applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: 'audio', text: spoken?.line || '' }, result: { asset } })
      else studio.applyJob({ pid: project.id, target: { kind: 'shot', shotId: shot.id, field: asset.kind === 'video' ? 'video' : 'image' }, result: { asset } })
    } catch (error) {
      toast('err', error.message)
    }
  }
  const neighbors = shotsOf(project, episodeIndex)

  return h('aside', { className: 'db-inspector', 'aria-label': `镜头 ${index + 1} 详情` },
    h('header', { className: 'db-inspector-head' },
      h('strong', null, `镜头 ${pad2(index + 1)}`), h('span', { className: 'db-muted' }, `共 ${total} 个`),
      h('span', { className: 'db-grow' }),
      h(IconBtn, { icon: 'back', size: 'sm', className: 'ghost', label: '上一个镜头', disabled: index === 0, onClick: () => studio.setSelectedShot(neighbors[index - 1].id) }),
      h(IconBtn, { icon: 'chevron', size: 'sm', className: 'ghost', label: '下一个镜头', disabled: index === total - 1, onClick: () => studio.setSelectedShot(neighbors[index + 1].id) }),
      h(Menu, {
        button: ({ toggle }) => h(IconBtn, { icon: 'more', size: 'sm', className: 'ghost', label: '更多操作', onClick: toggle }),
        items: [
          { label: '前移一位', icon: 'up', disabled: index === 0, onClick: () => mutateList((list) => { [list[index - 1], list[index]] = [list[index], list[index - 1]] }) },
          { label: '后移一位', icon: 'down', disabled: index === total - 1, onClick: () => mutateList((list) => { [list[index], list[index + 1]] = [list[index + 1], list[index]] }) },
          { label: '复制镜头', icon: 'copy', onClick: () => mutateList((list) => list.splice(index + 1, 0, { ...clone(shot), id: uid('s') })) },
          { label: '删除镜头', icon: 'trash', danger: true, onClick: () => { studio.setUndoStore(studio.store); mutateList((list) => list.splice(index, 1)); studio.setSelectedShot(neighbors[index + 1]?.id || neighbors[index - 1]?.id || null) } },
        ],
      }),
      h(IconBtn, { icon: 'close', size: 'sm', className: 'ghost', label: '关闭镜头详情', onClick: onClose })),

    h('div', { className: 'db-inspector-scroll' },
      h('div', { className: 'db-inspector-media' },
        h(Frame, {
          asset: shot.image, shot, index, job: imageJob, emptyLabel: '还没有关键帧',
          onOpen: shot.image ? () => studio.setLightbox({ items: (shot.images.length ? shot.images : [shot.image]).map((asset, i) => ({ asset, title: `第${episodeIndex}集 镜头${index + 1}`, note: asset.source === 'sketch' ? '本地草图' : asset.source === 'upload' ? '上传' : asset.provider })), start: Math.max(0, shot.images.findIndex((a) => a.file === shot.image.file)) }) : undefined,
        }),
        h('div', { className: 'db-inspector-actions' },
          h(Btn, { kind: 'primary', icon: shot.image ? 'refresh' : 'sparkles', disabled: Boolean(imageJob), onClick: () => studio.generateImages(episodeIndex, [shot.id]) }, imageJob ? '出图中' : shot.image ? '重新出图' : 'AI 出图'),
          h(Btn, { icon: 'pencil', onClick: () => studio.sketchShots(episodeIndex, [shot.id]) }, '画草图'),
          h(FilePick, { icon: 'upload', accept: 'image/png,image/jpeg,image/webp,video/mp4,video/webm', onPick: upload }, '上传'),
          imageJob ? h(Btn, { kind: 'ghost', onClick: () => studio.cancelJobs([imageJob.id]) }, '取消') : null,
          shot.images.length > 1 ? h('div', { className: 'db-versions' }, shot.images.map((asset) => h('button', {
            key: asset.file, type: 'button', 'aria-pressed': asset.file === shot.image?.file, 'aria-label': '改用这一版画面',
            onClick: () => patchShot(shot.id, (target) => { target.image = asset }),
          }, h('img', { src: mediaUrl(asset), alt: '', loading: 'lazy' })))) : null,
          shot.images.length > 1 ? h('span', { className: 'db-muted' }, `${shot.images.length} 个版本，点击切换`) : null)),

      h('div', { className: 'db-form-row three' },
        h(Field, { label: '景别' }, h('select', { className: 'db-select', value: shot.shotSize, onChange: set('shotSize') }, SHOT_SIZES.map((size) => h('option', { key: size }, size)))),
        h(Field, { label: '运镜' }, h('select', { className: 'db-select', value: shot.camera, onChange: set('camera') }, CAMERAS.map((camera) => h('option', { key: camera }, camera)))),
        h(Field, { label: '时长（秒）' }, h('input', { className: 'db-input', type: 'number', min: 0, step: 0.5, value: shot.duration, onChange: (e) => patchShot(shot.id, (target) => { target.duration = Math.max(0, Number(e.target.value) || 0) }) }))),

      project.characters.length ? h('div', { className: 'db-field' },
        h('span', { className: 'db-label' }, '出镜角色', h('em', null, '外貌和定妆照会自动带进出图')),
        h('div', { className: 'db-chips' }, project.characters.filter((c) => c.name.trim()).map((character) => {
          const on = composed.cast.some((c) => c.id === character.id)
          return h('button', {
            key: character.id, type: 'button', className: 'db-chip person', 'aria-pressed': on,
            onClick: () => patchShot(shot.id, (target) => {
              const names = composed.cast.map((c) => c.name.trim())
              target.cast = on ? names.filter((name) => name !== character.name.trim()) : [...names, character.name.trim()]
              target.castSet = true
            }),
          }, character.portrait ? h('img', { src: mediaUrl(character.portrait), alt: '' }) : h('i', null, character.name.slice(0, 1)), character.name)
        }))) : null,

      h(Field, { label: '画面描述' }, h('textarea', { className: 'db-textarea', rows: 3, value: shot.description, placeholder: '谁、在哪、做什么、什么情绪', onChange: set('description') })),

      h(Field, { label: '台词 / 旁白', hint: '格式：角色名：台词' }, h('textarea', { className: 'db-textarea', rows: 2, value: shot.dialogue, placeholder: '没有台词就留空或写（无）', onChange: set('dialogue') })),
      h('div', { className: 'db-inline-actions' },
        h(Btn, { size: 'sm', icon: 'mic', disabled: !spoken || Boolean(audioJob), busy: Boolean(audioJob), onClick: () => studio.generateVoices(episodeIndex, [shot.id]) }, shot.audio ? '重新配音' : '配音'),
        shot.audio ? h(AudioChip, { asset: shot.audio }) : null,
        stale ? h(Tag, { tone: 'warn', icon: 'warning' }, '台词改过了，配音还是旧的') : null,
        spoken && !shot.audio ? h('span', { className: 'db-muted' }, spoken.speaker ? `由 ${spoken.speaker} 的音色朗读` : '由默认音色朗读') : null,
        shot.audio ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除配音', onClick: () => patchShot(shot.id, (target) => { target.audio = null; target.audioText = '' }) }) : null),

      h(Field, { label: '生图提示词', hint: '只写画面，人物写姓名即可' }, h('textarea', { className: 'db-textarea', rows: 4, value: shot.imagePrompt, placeholder: '留空时使用画面描述', onChange: set('imagePrompt') })),
      h('div', { className: 'db-inline-actions' },
        h(Btn, { size: 'sm', kind: 'ghost', icon: showFinal ? 'up' : 'down', onClick: () => setShowFinal(!showFinal) }, '实际发送的提示词'),
        h(Btn, { size: 'sm', kind: 'ghost', icon: 'copy', disabled: !composed.prompt, onClick: () => studio.copy(composed.prompt, '提示词') }, '复制'),
        composed.refs.length ? h(Tag, { tone: 'info', icon: 'image' }, `带 ${composed.refs.length} 张定妆照参考`) : null),
      showFinal ? h('p', { className: 'db-final-prompt' }, composed.prompt || '画面描述和提示词都是空的。') : null,

      h(Field, { label: '视频提示词', hint: '只写运动：镜头怎么动、人怎么动' }, h('textarea', { className: 'db-textarea', rows: 2, value: shot.videoPrompt, onChange: set('videoPrompt') })),
      h('div', { className: 'db-inline-actions' },
        h(Btn, { size: 'sm', icon: 'film', disabled: Boolean(videoJob) || !shot.image, busy: Boolean(videoJob), onClick: () => studio.generateVideos(episodeIndex, [shot.id]) }, videoJob ? videoJob.message || '生成中' : shot.video ? '重新生成视频' : '图生视频'),
        shot.video ? h(Btn, { size: 'sm', kind: 'ghost', icon: 'play', onClick: () => studio.setLightbox({ items: [{ asset: shot.video, title: `第${episodeIndex}集 镜头${index + 1} 视频`, note: shot.video.provider }] }) }, '播放') : null,
        shot.video ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: '移除视频', onClick: () => patchShot(shot.id, (target) => { target.video = null }) }) : null,
        videoJob ? h(Btn, { size: 'sm', kind: 'ghost', onClick: () => studio.cancelJobs([videoJob.id]) }, '取消') : null,
        !shot.video && !videoJob ? h('span', { className: 'db-muted' }, studio.videoVendor === 'local' ? `合成时自动加「${shot.camera}」动效` : '') : null)))
}

function BoardTable({ shots }) {
  const { patchShot, patch, episodeIndex } = useStudio()
  const cell = (shot, field, rows) => h('textarea', { className: 'db-cell', rows, value: shot[field], onChange: (e) => patchShot(shot.id, (target) => { target[field] = e.target.value }) })
  return h('div', { className: 'db-table-wrap' }, h('table', { className: 'db-table' },
    h('thead', null, h('tr', null, ['镜号', '画面', '景别', '运镜', '画面描述', '台词 / 旁白', '秒', '生图提示词', '视频提示词', ''].map((title, i) => h('th', { key: i }, title)))),
    h('tbody', null, shots.map((shot, index) => h('tr', { key: shot.id },
      h('td', { className: 'c-no' }, index + 1),
      h('td', { className: 'c-thumb' }, h(Frame, { asset: shot.image, shot })),
      h('td', null, h('select', { className: 'db-select', 'aria-label': '景别', value: shot.shotSize, onChange: (e) => patchShot(shot.id, (target) => { target.shotSize = e.target.value }) }, SHOT_SIZES.map((size) => h('option', { key: size }, size)))),
      h('td', null, h('select', { className: 'db-select', 'aria-label': '运镜', value: shot.camera, onChange: (e) => patchShot(shot.id, (target) => { target.camera = e.target.value }) }, CAMERAS.map((camera) => h('option', { key: camera }, camera)))),
      h('td', null, cell(shot, 'description', 3)),
      h('td', null, cell(shot, 'dialogue', 3)),
      h('td', null, h('input', { className: 'db-input', type: 'number', min: 0, step: 0.5, 'aria-label': '时长', value: shot.duration, onChange: (e) => patchShot(shot.id, (target) => { target.duration = Math.max(0, Number(e.target.value) || 0) }) })),
      h('td', null, cell(shot, 'imagePrompt', 3)),
      h('td', null, cell(shot, 'videoPrompt', 3)),
      h('td', null, h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: `删除镜头 ${index + 1}`, onClick: () => patch((draft) => { draft.boards[String(episodeIndex)] = draft.boards[String(episodeIndex)].filter((item) => item.id !== shot.id) }) })))))))
}

function BoardPage() {
  const studio = useStudio()
  const { project, episodeIndex, selectedShot, setSelectedShot, patch, busy, generate } = studio
  const [view, setView] = useState('grid')
  const shots = shotsOf(project, episodeIndex)
  const episode = project.episodes.find((e) => e.index === episodeIndex)
  const total = totalDuration(shots)
  const over = total > 120
  const missing = shots.filter((shot) => !shot.image)
  const selectedIndex = shots.findIndex((shot) => shot.id === selectedShot)
  const selected = selectedIndex >= 0 ? shots[selectedIndex] : null
  const exportBase = `${safeName(project.name)}-第${episodeIndex}集`
  const activeImageJobs = studio.jobs.filter((job) => isActive(job) && job.type === 'image' && shots.some((shot) => shot.id === job.target?.shotId))

  const addShot = () => {
    const shot = emptyShot()
    patch((draft) => {
      const key = String(episodeIndex)
      while (draft.episodes.length < episodeIndex) draft.episodes.push(blankEpisode(draft.episodes.length + 1))
      if (!Array.isArray(draft.boards[key])) draft.boards[key] = []
      draft.boards[key].push(shot)
    })
    setSelectedShot(shot.id)
  }

  return h('div', { className: cx('db-board', selected && view === 'grid' && 'with-inspector') },
    h('div', { className: 'db-board-main' },
      h(EpisodeTabs),
      episode && (episode.hook || episode.conflict) ? h('p', { className: 'db-board-brief' }, h('b', null, '钩子'), episode.hook || '未填写', h('b', null, '卡点'), episode.cliffhanger || '未填写') : null,
      h('div', { className: 'db-toolbar' },
        h(Btn, { kind: shots.length ? undefined : 'primary', icon: 'sparkles', busy: busy === 'storyboard', disabled: Boolean(busy), onClick: () => generate('storyboard') }, busy === 'storyboard' ? '生成中' : shots.length ? '重新拆分镜' : 'AI 拆分镜'),
        shots.length && (missing.length || activeImageJobs.length) ? h(Btn, { kind: 'primary', icon: 'image', disabled: activeImageJobs.length > 0, busy: activeImageJobs.length > 0, onClick: () => studio.generateImages(episodeIndex, missing.map((shot) => shot.id)) },
          activeImageJobs.length ? `出图中，还剩 ${activeImageJobs.length} 张` : `给 ${missing.length} 个镜头出图`) : null,
        shots.length && !missing.length && !activeImageJobs.length ? h(Btn, { kind: 'primary', icon: 'studio', onClick: () => studio.navigate('studio', episodeIndex) }, '关键帧已齐，去成片') : null,
        h(Btn, { icon: 'plus', onClick: addShot }, '添加镜头'),
        shots.length ? h(Menu, {
          align: 'left',
          button: ({ toggle }) => h(Btn, { icon: 'more', onClick: toggle }, '批量'),
          items: [
            { label: '全部重新出图', hint: `${shots.length} 张，保留旧版本`, icon: 'refresh', onClick: () => studio.generateImages(episodeIndex, shots.map((shot) => shot.id)) },
            { label: '给缺图的镜头画草图', hint: '本地绘制，不消耗额度', icon: 'pencil', disabled: !missing.length, onClick: () => studio.sketchShots(episodeIndex, missing.map((shot) => shot.id)) },
            { label: '给所有台词配音', icon: 'mic', onClick: () => studio.generateVoices(episodeIndex, shots.filter((shot) => !shot.audio).map((shot) => shot.id)) },
            { label: '图生视频', hint: '给有关键帧的镜头生成动态画面', icon: 'film', onClick: () => studio.generateVideos(episodeIndex, shots.filter((shot) => shot.image && !shot.video).map((shot) => shot.id)) },
            { label: '导出 Markdown', icon: 'download', onClick: () => download(`${exportBase}.md`, toMarkdown(project, episodeIndex, shots), 'text/markdown;charset=utf-8') },
            { label: '导出 CSV', icon: 'download', onClick: () => download(`${exportBase}.csv`, toCsv(project, episodeIndex, shots), 'text/csv;charset=utf-8') },
          ],
        }) : null,
        activeImageJobs.length ? h(Btn, { kind: 'ghost', onClick: () => studio.cancelJobs(activeImageJobs.map((job) => job.id)) }, '停止出图') : null,
        h('span', { className: 'db-grow' }),
        shots.length ? h('span', { className: cx('db-total', over && 'over') }, h('b', null, clock(total)), `${shots.length} 个镜头`, over ? '，超过 2 分钟' : '') : null,
        h(Segment, { label: '分镜视图', value: view, onChange: setView, options: [['grid', '画格', 'grid'], ['table', '表格', 'list']] })),

      shots.length === 0
        ? h(Empty, { icon: 'board', title: `第 ${episodeIndex} 集还没有分镜`, action: h('div', { className: 'db-row' }, h(Btn, { kind: 'primary', icon: 'sparkles', disabled: Boolean(busy), onClick: () => generate('storyboard') }, 'AI 拆分镜'), h(Btn, { icon: 'plus', onClick: addShot }, '手动添加')) },
          '按这一集的钩子、冲突和卡点拆成 8~14 个镜头，每个镜头自带画面描述、台词和提示词。')
        : view === 'grid'
          ? h('div', { className: 'db-wall' },
            shots.map((shot, index) => h(ShotTile, { key: shot.id, shot, index, selected: shot.id === selectedShot, onSelect: () => setSelectedShot(shot.id === selectedShot ? null : shot.id) })),
            h('button', { type: 'button', className: 'db-tile-add', onClick: addShot, 'aria-label': '添加镜头' }, h(Icon, { name: 'plus', size: 22 }), '添加镜头'))
          : h(BoardTable, { shots })),
    selected && view === 'grid' ? h(ShotInspector, { key: selected.id, shot: selected, index: selectedIndex, total: shots.length, onClose: () => setSelectedShot(null) }) : null)
}
