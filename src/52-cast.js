// 角色：固定外貌、定妆照、配音音色。

/** 可选的音色：系统语音列出本机中文语音，云端配音列出引擎自带音色。 */
function useVoiceOptions() {
  const { engine } = useStudio()
  return useMemo(() => {
    const vendor = engine?.settings?.tts?.vendor || 'system'
    if (vendor === 'system') return (engine?.voices || []).map((voice) => ({ id: voice.id, name: `${voice.id}（${voice.locale === 'zh_CN' ? '普通话' : voice.locale === 'zh_HK' ? '粤语' : voice.locale === 'zh_TW' ? '台湾国语' : voice.locale}）` }))
    const item = engine?.catalog?.tts?.find((entry) => entry.id === vendor)
    return (item?.voices || []).map((voice) => ({ id: voice, name: voice }))
  }, [engine])
}

function VoiceSelect({ value, onChange, label = '配音音色' }) {
  const options = useVoiceOptions()
  const { toast } = useStudio()
  const [testing, setTesting] = useState(false)
  const audition = async () => {
    setTesting(true)
    try {
      const payload = await request('settings/test', { capability: 'tts', voice: value || undefined, text: '你好，这是我的声音。你觉得合适吗？' })
      playingAudio?.pause()
      playingAudio = new Audio(mediaUrl(payload.asset))
      await playingAudio.play()
    } catch (error) {
      toast('err', `试听失败：${error.message}`)
    } finally {
      setTesting(false)
    }
  }
  return h('div', { className: 'db-voice' },
    h('select', { className: 'db-select', 'aria-label': label, value, onChange: (e) => onChange(e.target.value) },
      h('option', { value: '' }, '跟随默认音色'),
      options.map((voice) => h('option', { key: voice.id, value: voice.id }, voice.name)),
      value && !options.some((voice) => voice.id === value) ? h('option', { value }, `${value}（当前引擎没有）`) : null),
    h(IconBtn, { icon: testing ? 'clock' : 'volume', label: '试听音色', disabled: testing, onClick: audition }))
}

function CastPage() {
  const studio = useStudio()
  const { project, patch, busy, generate, generatePortrait, jobFor, toast } = studio
  const patchCharacter = (id, mutate) => patch((draft) => {
    const target = draft.characters.find((c) => c.id === id)
    if (target) mutate(target)
  })
  const upload = async (character, file) => {
    try {
      const asset = await uploadMedia(project.id, file, { name: `${character.name} 定妆照`, target: { kind: 'character', id: character.id } })
      if (asset.kind !== 'image') throw new Error('定妆照需要是图片')
      studio.applyJob({ pid: project.id, target: { kind: 'character', id: character.id }, result: { asset } })
    } catch (error) {
      toast('err', error.message)
    }
  }
  const missing = project.characters.filter((c) => c.appearance.trim() && !c.portrait)

  return h('div', { className: 'db-stack' },
    h('div', { className: 'db-toolbar' },
      h(Btn, { kind: 'primary', icon: 'sparkles', busy: busy === 'characters', disabled: Boolean(busy), onClick: () => generate('characters') }, busy === 'characters' ? '生成中' : 'AI 设计角色'),
      h(Btn, { icon: 'plus', onClick: () => patch((draft) => { draft.characters.push({ id: uid('c'), name: '新角色', identity: '', personality: '', appearance: '', portrait: null, portraits: [], voice: '' }) }) }, '添加角色'),
      missing.length ? h(Btn, { icon: 'image', onClick: () => missing.forEach((c) => generatePortrait(c.id)) }, `补齐 ${missing.length} 张定妆照`) : null,
      h('span', { className: 'db-grow' }),
      h('label', { className: 'db-inline-field' }, h('span', { className: 'db-muted' }, '旁白与默认音色'),
        h(VoiceSelect, { label: '旁白与默认音色', value: project.narratorVoice, onChange: (value) => patch((draft) => { draft.narratorVoice = value }) }))),

    project.characters.length === 0
      ? h(Empty, { icon: 'cast', title: '还没有角色' }, '角色的固定外貌会逐字写进每个出镜镜头的提示词；定妆照会作为参考图，让同一个人在不同镜头里长得一样。')
      : h('div', { className: 'db-cast' }, project.characters.map((character, index) => {
        const job = jobFor({ kind: 'character', id: character.id })
        return h('article', { key: character.id, className: 'db-char' },
          h('div', { className: 'db-char-photo' },
            h(Frame, {
              asset: character.portrait, job, ratio: '3 / 4', position: 'center 18%', emptyLabel: '定妆照',
              onOpen: character.portrait ? () => studio.setLightbox({ items: character.portraits.map((asset) => ({ asset, title: `${character.name} 定妆照`, note: asset.provider })), start: Math.max(0, character.portraits.findIndex((a) => a.file === character.portrait.file)) }) : undefined,
            }),
            h('div', { className: 'db-char-photo-actions' },
              h(Btn, { size: 'sm', kind: character.portrait ? undefined : 'primary', icon: character.portrait ? 'refresh' : 'sparkles', disabled: Boolean(job), onClick: () => generatePortrait(character.id) }, character.portrait ? '重拍' : '生成定妆照'),
              h(FilePick, { size: 'sm', kind: 'ghost', icon: 'upload', accept: 'image/png,image/jpeg,image/webp', onPick: (file) => upload(character, file) }, '上传')),
            character.portraits.length > 1 ? h('div', { className: 'db-versions' }, character.portraits.map((asset) => h('button', {
              key: asset.file, type: 'button', 'aria-pressed': asset.file === character.portrait?.file, 'aria-label': '改用这一版定妆照',
              onClick: () => patchCharacter(character.id, (c) => { c.portrait = asset }),
            }, h('img', { src: mediaUrl(asset), alt: '', loading: 'lazy' })))) : null),
          h('div', { className: 'db-char-body' },
            h('div', { className: 'db-row' },
              h('input', { className: 'db-input db-input-bare db-char-name', 'aria-label': '角色姓名', value: character.name, placeholder: `角色 ${index + 1}`, onChange: (e) => patchCharacter(character.id, (c) => { c.name = e.target.value }) }),
              h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost danger', label: `删除角色 ${character.name}`, onClick: async () => { if (await studio.ask('删除这个角色？', `「${character.name || '未命名角色'}」的角色卡会被删除，镜头里的文字不受影响。`, '删除角色', { danger: true })) { studio.setUndoStore(studio.store); patch((draft) => { draft.characters = draft.characters.filter((c) => c.id !== character.id) }) } } })),
            h('div', { className: 'db-form-row' },
              h(Field, { label: '身份' }, h('input', { className: 'db-input', value: character.identity, placeholder: '例：外卖员，隐藏的继承人', onChange: (e) => patchCharacter(character.id, (c) => { c.identity = e.target.value }) })),
              h(Field, { label: '性格' }, h('input', { className: 'db-input', value: character.personality, placeholder: '例：隐忍，嘴硬心软', onChange: (e) => patchCharacter(character.id, (c) => { c.personality = e.target.value }) }))),
            h(Field, { label: '固定外貌', hint: '全剧不变，会逐字写进提示词' },
              h('textarea', { className: 'db-textarea', rows: 4, value: character.appearance, placeholder: '年龄、发型、服装、体型、一个辨识特征。40~80 字。', onChange: (e) => patchCharacter(character.id, (c) => { c.appearance = e.target.value }) })),
            h('div', { className: 'db-row' },
              h(Field, { label: '配音音色' }, h(VoiceSelect, { value: character.voice, onChange: (value) => patchCharacter(character.id, (c) => { c.voice = value }) })),
              h('span', { className: 'db-grow' }),
              h(Btn, { kind: 'ghost', size: 'sm', icon: 'copy', disabled: !character.appearance.trim(), onClick: () => studio.copy(`${character.name}：${character.appearance}`, '外貌描述') }, '复制外貌'))))
      })))
}
