// 立项与分集：故事的文字部分。

const SEEDS = [
  ['悬疑', '来自明天的来电', '一位接线员每晚接到明天的求救电话，直到来电人说出了她自己的名字。'],
  ['重生', '重来一次的选择', '重回毕业那天，她放弃了上一世的成功捷径，却发现好友正在重复她犯过的错。'],
  ['甜宠', '交换身份的邻居', '两个互不相识的邻居每天醒来都会交换身份，必须共同解决一场即将到来的婚礼危机。'],
  ['逆袭', '被退婚的外卖员', '被当众退婚的外卖员，其实是隐姓埋名十年的集团继承人，而退婚宴的酒店正是他家的产业。'],
]

/** 计划集数：允许暂时清空，失焦时再校正到 1~60。 */
function EpisodeCount({ value, onChange }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const commit = () => {
    const next = Math.max(1, Math.min(60, Math.round(Number(text) || value || 1)))
    setText(String(next))
    if (next !== value) onChange(next)
  }
  return h('input', { className: 'db-input', type: 'number', min: 1, max: 60, value: text, 'aria-label': '计划集数', onChange: (e) => setText(e.target.value), onBlur: commit, onKeyDown: (e) => { if (e.key === 'Enter') e.currentTarget.blur() } })
}

function BriefPage() {
  const studio = useStudio()
  const { project, patch, busy, generate } = studio
  const brief = project.brief
  return h('div', { className: 'db-two' },
    h('div', { className: 'db-stack' },
      h('section', { className: 'db-card' },
        h(Field, { label: '剧名' }, h('input', { className: 'db-input db-input-title', value: project.name, onChange: (e) => patch((draft) => { draft.name = e.target.value }) })),
        h(Field, { label: '一句话梗概', hint: '谁，想要什么，被什么挡住' },
          h('textarea', { className: 'db-textarea', rows: 3, value: brief.logline, placeholder: '例：被退婚的外卖员，其实是隐藏十年的集团继承人。', onChange: (e) => patch((draft) => { draft.brief.logline = e.target.value }) })),
        h('div', { className: 'db-form-row' },
          h(Field, { label: '题材' }, h(Chips, { label: '题材', options: GENRES, value: brief.genre, onChange: (value) => patch((draft) => { draft.brief.genre = value }) })),
          h(Field, { label: '计划集数', hint: '改小不会删除已写的分集' }, h(EpisodeCount, { value: brief.episodes, onChange: (value) => patch((draft) => { draft.brief.episodes = value }) }))),
        h('div', { className: 'db-row' },
          h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'outline', disabled: Boolean(busy), onClick: () => generate('outline') }, busy === 'outline' ? '生成中' : '生成剧本大纲'),
          h('span', { className: 'db-muted' }, '一次生成角色卡和全部分集'))),

      h('section', { className: 'db-card' },
        h('header', { className: 'db-section-head' }, h('h2', null, '画面风格'), h('span', { className: 'db-muted' }, '会写进每一张图的提示词')),
        h(Field, { label: '画风' }, h(Chips, { label: '画风', options: STYLES, value: brief.style, onChange: (value) => patch((draft) => { draft.brief.style = value }) })),
        h('div', { className: 'db-field' },
          h('span', { className: 'db-label' }, '影调'),
          h('div', { className: 'db-looks', role: 'group', 'aria-label': '影调' }, LOOKS.map((look) => h('button', {
            key: look.id, type: 'button', className: 'db-look', 'aria-pressed': project.visual.look === look.id,
            onClick: () => patch((draft) => { draft.visual.look = look.id }),
          }, h('i', { style: { background: `linear-gradient(160deg, ${look.colors[0]} 0%, ${look.colors[1]} 62%, ${look.colors[2]} 100%)` } }), h('span', null, look.name))))),
        h('div', { className: 'db-form-row' },
          h(Field, { label: '补充风格词', hint: '选填' }, h('input', { className: 'db-input', value: project.visual.extra, placeholder: '例：胶片颗粒，王家卫式抽帧', onChange: (e) => patch((draft) => { draft.visual.extra = e.target.value }) })),
          h(Field, { label: '不想出现的内容', hint: '选填，部分引擎支持' }, h('input', { className: 'db-input', value: project.visual.negative, placeholder: '例：文字水印，多余的手指', onChange: (e) => patch((draft) => { draft.visual.negative = e.target.value }) }))),
        h('p', { className: 'db-note' }, STYLE_PROMPTS[brief.style], LOOKS.find((look) => look.id === project.visual.look)?.prompt ? `，${LOOKS.find((look) => look.id === project.visual.look).prompt}` : ''))),

    h('aside', { className: 'db-stack' },
      h('section', { className: 'db-card' },
        h('header', { className: 'db-section-head' }, h('h2', null, '没想好？从这里起步')),
        h('div', { className: 'db-seeds' }, SEEDS.map(([genre, title, logline]) => h('button', {
          key: title, type: 'button', disabled: Boolean(brief.logline.trim()),
          onClick: () => patch((draft) => { draft.brief.logline = logline; draft.brief.genre = genre }),
        }, h('strong', null, title, h(Tag, null, genre)), h('span', null, logline)))),
        brief.logline.trim() ? h('p', { className: 'db-note' }, '已经有梗概了。清空梗概后可以改用这些起点。') : null),
      h('section', { className: 'db-card db-tools' },
        h('header', { className: 'db-section-head' }, h('h2', null, '项目')),
        h(Btn, { kind: 'ghost', icon: 'copy', onClick: studio.duplicateProject }, '创建副本'),
        h(Btn, { kind: 'ghost', icon: 'download', onClick: studio.backupProject }, '导出备份'),
        h(Btn, { kind: 'ghost', icon: 'trash', className: 'danger', onClick: studio.deleteProject }, '删除项目'))))
}

function EpisodesPage() {
  const studio = useStudio()
  const { project, patch, busy, generate, ask, navigate } = studio
  const patchEpisode = (id, field, value) => patch((draft) => {
    const target = draft.episodes.find((e) => e.id === id)
    if (target) target[field] = value
  })
  return h('div', { className: 'db-stack' },
    h('div', { className: 'db-toolbar' },
      h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'episodes', disabled: Boolean(busy), onClick: () => generate('episodes') }, busy === 'episodes' ? '生成中' : 'AI 生成分集'),
      h(Btn, { icon: 'plus', onClick: () => patch((draft) => { draft.episodes.push(blankEpisode(draft.episodes.length + 1)); draft.brief.episodes = Math.max(draft.brief.episodes, draft.episodes.length) }) }, '添加一集'),
      h('span', { className: 'db-grow' }),
      h('span', { className: 'db-muted' }, `共 ${project.episodes.length} 集`)),
    project.episodes.length === 0
      ? h(Empty, { icon: 'episodes', title: '还没有分集' }, '点「AI 生成分集」，按题材和角色写出每一集的钩子与卡点；也可以手动添加。')
      : project.episodes.map((episode) => {
        const shots = shotsOf(project, episode.index)
        return h('section', { key: episode.id, className: 'db-episode' },
          h('header', null,
            h('span', { className: 'db-ep-num' }, pad2(episode.index)),
            h('input', { className: 'db-input db-input-bare', 'aria-label': `第 ${episode.index} 集标题`, value: episode.title, onChange: (e) => patchEpisode(episode.id, 'title', e.target.value) }),
            shots.length ? h(Tag, { icon: 'board' }, `${shots.length} 镜`) : null,
            h(Btn, { kind: 'ghost', size: 'sm', icon: 'board', onClick: () => navigate('board', episode.index) }, shots.length ? '看分镜' : '拆分镜'),
            h(IconBtn, {
              icon: 'trash', size: 'sm', className: 'ghost danger', label: `删除第 ${episode.index} 集`,
              onClick: async () => {
                if (!await ask('删除这一集？', `第 ${episode.index} 集及其分镜将一起删除，其余分镜会随分集自动重新编号。`, '删除分集', { danger: true })) return
                studio.setUndoStore(studio.store)
                patch((draft) => removeEpisode(draft, episode.id))
              },
            })),
          h('div', { className: 'db-episode-body' },
            h(Field, { label: '前 3 秒钩子', wide: true }, h('textarea', { className: 'db-textarea', rows: 2, value: episode.hook, placeholder: '例：镜头怼脸——“你被退婚，是因为你配不上我。”', onChange: (e) => patchEpisode(episode.id, 'hook', e.target.value) })),
            h(Field, { label: '本集冲突' }, h('textarea', { className: 'db-textarea', rows: 3, value: episode.conflict, placeholder: '谁和谁、因为什么、冲突升级到什么程度', onChange: (e) => patchEpisode(episode.id, 'conflict', e.target.value) })),
            h(Field, { label: '结尾卡点' }, h('textarea', { className: 'db-textarea', rows: 3, value: episode.cliffhanger, placeholder: '最后一秒抛出的信息，让人非看下一集不可', onChange: (e) => patchEpisode(episode.id, 'cliffhanger', e.target.value) }))))
      }))
}
