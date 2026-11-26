// 总览：海报、制作流水线、分集货架、待办。

/** 取一张能代表这部剧的画面：第一集第一张有图的镜头，其次是主角定妆照。 */
function posterOf(project) {
  for (const episode of project.episodes) {
    const cover = shotsOf(project, episode.index).find((shot) => shot.id === episode.cover && shot.image)
    if (cover) return cover.image
    const first = shotsOf(project, episode.index).find((shot) => shot.image)
    if (first) return first.image
  }
  return project.characters.find((c) => c.portrait)?.portrait || null
}

function pipelineOf(project) {
  const episodes = project.episodes
  const shots = episodes.flatMap((e) => shotsOf(project, e.index))
  const spoken = shots.filter((shot) => parseDialogue(shot.dialogue))
  const told = episodes.filter((e) => e.hook.trim() && e.conflict.trim() && e.cliffhanger.trim()).length
  const boarded = episodes.filter((e) => shotsOf(project, e.index).length).length
  const rendered = episodes.filter((e) => e.renders.length).length
  const looks = project.characters.filter((c) => c.appearance.trim()).length
  return [
    { id: 'brief', name: '立项', done: project.brief.logline.trim() ? 1 : 0, total: 1, text: project.brief.logline.trim() ? '梗概已定' : '写一句梗概' },
    { id: 'cast', name: '角色', done: looks, total: Math.max(1, project.characters.length), text: project.characters.length ? `${project.characters.filter((c) => c.portrait).length}/${project.characters.length} 有定妆照` : '还没有角色' },
    { id: 'episodes', name: '分集', done: told, total: Math.max(1, episodes.length), text: `${told}/${episodes.length} 集完整` },
    { id: 'board', name: '分镜', done: boarded, total: Math.max(1, episodes.length), text: `${shots.length} 个镜头` },
    { id: 'board', key: 'images', name: '出图', done: shots.filter((s) => s.image).length, total: Math.max(1, shots.length), text: `${shots.filter((s) => s.image).length}/${shots.length} 镜有图` },
    { id: 'studio', key: 'voice', name: '配音', done: spoken.filter((s) => s.audio).length, total: Math.max(1, spoken.length), text: `${spoken.filter((s) => s.audio).length}/${spoken.length} 句` },
    { id: 'studio', name: '成片', done: rendered, total: Math.max(1, episodes.length), text: `${rendered}/${episodes.length} 集` },
  ]
}

function OverviewPage() {
  const studio = useStudio()
  const { project, navigate, patch } = studio
  const poster = posterOf(project)
  const stages = pipelineOf(project)
  const checks = projectChecks(project)
  const nextStage = stages.find((stage) => stage.done < stage.total) || stages[stages.length - 1]
  const next = checks[0]?.tab || nextStage.id
  const look = LOOKS.find((item) => item.id === project.visual.look)

  return h('div', { className: 'db-overview' },
    h('section', { className: 'db-hero' },
      h('div', { className: 'db-poster' },
        h(Frame, { asset: poster, emptyLabel: '出第一张图后，这里就是海报', onOpen: poster ? () => studio.setLightbox({ items: [{ asset: poster, title: project.name }] }) : undefined }),
        h('div', { className: 'db-poster-title', 'aria-hidden': true }, h('strong', null, project.name.slice(0, 14)), h('span', null, `${project.brief.genre}短剧　共 ${project.episodes.length} 集`))),
      h('div', { className: 'db-hero-body' },
        h('div', { className: 'db-row' }, h(Tag, null, project.brief.genre), h(Tag, null, project.brief.style), look && look.id !== 'natural' ? h(Tag, null, look.name) : null, h(Tag, null, '竖屏 9:16')),
        h('h2', { className: 'db-title' }, project.name),
        h('p', { className: 'db-hero-logline' }, project.brief.logline || '还没有梗概。用一句话写下主角、目标和冲突，剩下的交给流水线。'),
        h('div', { className: 'db-row' },
          h(Btn, { kind: 'primary', icon: 'chevron', className: 'trail', onClick: () => navigate(next) }, checks[0] ? `下一步：${checks[0].text}` : '继续制作'),
          project.episodes.some((e) => shotsOf(project, e.index).length) ? h(Btn, { icon: 'play', onClick: () => navigate('studio') }, '试映') : null),
        h('ol', { className: 'db-pipeline', 'aria-label': '制作进度' }, stages.map((stage, i) => h('li', { key: stage.key || `${stage.id}-${i}` },
          h('button', { type: 'button', onClick: () => navigate(stage.id) },
            h(Ring, { value: stage.done / stage.total, size: 40 }, stage.done >= stage.total ? h(Icon, { name: 'check', size: 15 }) : String(i + 1)),
            h('strong', null, stage.name),
            h('small', null, stage.text)))))),
    ),

    h('div', { className: 'db-overview-cols' },
      h('section', { className: 'db-shelf' },
        h('header', { className: 'db-section-head' }, h('h2', null, '分集'), h(Btn, { kind: 'ghost', size: 'sm', onClick: () => navigate('episodes') }, '编辑分集')),
        project.episodes.length === 0
          ? h(Empty, { icon: 'episodes', title: '还没有分集', action: h(Btn, { kind: 'primary', onClick: () => navigate('brief') }, '去立项生成大纲') }, '写好梗概后，一次生成角色和全部分集。')
          : project.episodes.map((episode) => {
            const shots = shotsOf(project, episode.index)
            const progress = episodeProgress(project, episode.index)
            return h('article', { className: 'db-ep-card', key: episode.id },
              h('div', { className: 'db-ep-card-head' },
                h('span', { className: 'db-ep-num' }, pad2(episode.index)),
                h('div', { className: 'db-grow' },
                  h('h3', null, episode.title),
                  h('p', null, episode.hook || '还没有写开场钩子')),
                h('div', { className: 'db-row tight' },
                  shots.length ? h(Tag, { tone: progress.images === shots.length ? 'ok' : '' , icon: 'image' }, `${progress.images}/${shots.length}`) : null,
                  progress.spoken ? h(Tag, { tone: progress.voiced === progress.spoken ? 'ok' : '', icon: 'mic' }, `${progress.voiced}/${progress.spoken}`) : null,
                  progress.render ? h(Tag, { tone: 'rec', icon: 'film' }, '已成片') : null)),
              shots.length
                ? h('div', { className: 'db-strip' },
                  shots.slice(0, 9).map((shot, i) => h(Frame, { key: shot.id, asset: shot.image, shot, index: i, job: studio.jobFor({ shotId: shot.id, field: 'image' }), onOpen: () => navigate('board', episode.index, shot.id) })),
                  shots.length > 9 ? h('button', { type: 'button', className: 'db-strip-more', onClick: () => navigate('board', episode.index) }, `+${shots.length - 9}`) : null)
                : h('button', { type: 'button', className: 'db-strip-empty', onClick: () => navigate('board', episode.index) }, h(Icon, { name: 'board', size: 16 }), '还没有分镜，去拆镜头'),
              h('div', { className: 'db-ep-card-foot' },
                h('span', { className: 'db-muted' }, shots.length ? `${shots.length} 个镜头，${clock(progress.seconds)}` : '待创作'),
                h('span', { className: 'db-grow' }),
                h(Btn, { kind: 'ghost', size: 'sm', icon: 'board', onClick: () => navigate('board', episode.index) }, '分镜'),
                h(Btn, { kind: 'ghost', size: 'sm', icon: 'studio', disabled: !shots.length, onClick: () => navigate('studio', episode.index) }, '成片')))
          })),

      h('aside', { className: 'db-side-col' },
        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '待办'), h('span', { className: 'db-muted' }, checks.length ? `${checks.length} 项` : '都处理完了')),
          checks.length
            ? h('ul', { className: 'db-todo' }, checks.slice(0, 5).map((check) => h('li', { key: check.text },
              h('button', { type: 'button', onClick: () => navigate(check.tab) },
                h('span', null, h('strong', null, check.text), h('small', null, check.detail)),
                h(Icon, { name: 'chevron', size: 14 })))))
            : h('p', { className: 'db-done' }, h(Icon, { name: 'check', size: 16 }), '故事、镜头和画面都齐了。成片后再过一遍下面的清单。')),
        h('section', { className: 'db-card' },
          h('header', { className: 'db-section-head' }, h('h2', null, '发布前检查')),
          [['looks', '同一角色在各镜头里长得一样'], ['continuity', '镜头衔接顺、场景不跳'], ['captions', '字幕和配音逐句对过'], ['rights', '没有真实明星肖像和未授权 IP']].map(([id, text]) => h('label', { className: 'db-checkline', key: id },
            h('input', { type: 'checkbox', checked: Boolean(project.checklist?.[id]), onChange: (event) => { const checked = event.target.checked; patch((draft) => { draft.checklist = { ...draft.checklist, [id]: checked } }) } }),
            text))),
        h('section', { className: 'db-card db-tools' },
          h('header', { className: 'db-section-head' }, h('h2', null, '项目')),
          h(Btn, { kind: 'ghost', icon: 'download', onClick: studio.backupProject }, '导出备份'),
          h(Btn, { kind: 'ghost', icon: 'copy', onClick: studio.duplicateProject }, '创建副本'),
          h(Btn, { kind: 'ghost', icon: 'library', onClick: () => navigate('library') }, '打开素材库'))),
    ))
}
