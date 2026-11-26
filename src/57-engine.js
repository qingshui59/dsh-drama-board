// 生成引擎：文本、出图、视频、配音、合成各用哪一家，以及各家的 API Key。

function KeyRow({ entry, state, onSave }) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async (next) => {
    setSaving(true)
    await onSave(entry.id, next)
    setSaving(false)
    setValue('')
  }
  return h('div', { className: 'db-key', id: `db-key-${entry.id}` },
    h('div', { className: 'db-key-name' },
      h('strong', null, entry.name),
      entry.hint ? h('span', { className: 'db-muted' }, entry.hint) : null),
    h('input', {
      className: 'db-input', type: 'password', autoComplete: 'off', spellCheck: false, value,
      placeholder: state?.set ? `已保存 ${state.hint}，输入新的可替换` : '粘贴 API Key', 'aria-label': `${entry.name} API Key`,
      onChange: (e) => setValue(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter' && value.trim()) save(value) },
    }),
    h(Btn, { size: 'sm', kind: value.trim() ? 'primary' : undefined, disabled: !value.trim() || saving, busy: saving, onClick: () => save(value) }, '保存'),
    state?.set ? h(IconBtn, { icon: 'trash', size: 'sm', className: 'ghost', label: `清除 ${entry.name} 的 Key`, onClick: () => save(null) }) : null,
    entry.url ? h('a', { className: 'db-link', href: entry.url, target: '_blank', rel: 'noreferrer noopener' }, '去获取') : h('span'))
}

/** 一种能力（出图 / 视频 / 配音 / 文本）的引擎选择。 */
function VendorPicker({ section, title, intro, children }) {
  const { engine, saveEngine } = useStudio()
  const config = engine.settings[section]
  const vendors = engine.catalog[section]
  const vendor = vendors.find((item) => item.id === config.vendor) || vendors[0]
  const keyState = vendor.key ? engine.settings.keys[vendor.key] : null
  const needsKey = vendor.key && !keyState?.set && !vendor.keyOptional
  const listId = `db-models-${section}`
  const [model, setModel] = useState(config.model || '')
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '')
  useEffect(() => { setModel(config.model || ''); setBaseUrl(config.baseUrl || '') }, [config.vendor, config.model, config.baseUrl])

  return h('section', { className: 'db-card db-engine' },
    h('header', { className: 'db-section-head' }, h('h2', null, title), h('span', { className: 'db-muted' }, intro)),
    h('div', { className: 'db-vendors', role: 'radiogroup', 'aria-label': title }, vendors.map((item) => h('button', {
      key: item.id, type: 'button', role: 'radio', 'aria-checked': item.id === vendor.id, className: 'db-vendor',
      onClick: () => saveEngine({ [section]: { vendor: item.id, model: '', baseUrl: item.id === config.vendor ? config.baseUrl : '' } }),
    }, h('strong', null, item.name), item.key && !item.keyOptional && !engine.settings.keys[item.key]?.set ? h('small', null, '需要 Key') : item.key ? h('small', { className: 'ok' }, item.keyOptional && !engine.settings.keys[item.key]?.set ? '免 Key' : 'Key 已填') : h('small', { className: 'ok' }, '无需配置')))),
    vendor.note ? h('p', { className: 'db-note' }, vendor.note) : null,
    needsKey ? h('p', { className: 'db-warn' }, h(Icon, { name: 'key', size: 15 }), `还没有填写${engine.catalog.keys.find((key) => key.id === vendor.key)?.name || ''}的 API Key。`,
      h('button', { type: 'button', className: 'db-link', onClick: () => document.getElementById(`db-key-${vendor.key}`)?.querySelector('input')?.focus() }, '现在填写')) : null,
    vendor.models.length || vendor.custom ? h('div', { className: 'db-form-row' },
      vendor.custom ? h(Field, { label: '接口地址（Base URL）', hint: '到 /v1 为止' }, h('input', { className: 'db-input', value: baseUrl, placeholder: 'https://example.com/v1', onChange: (e) => setBaseUrl(e.target.value), onBlur: () => { if (baseUrl !== (config.baseUrl || '')) saveEngine({ [section]: { baseUrl: baseUrl.trim() } }) } })) : null,
      h(Field, { label: '模型', hint: vendor.custom ? '填写服务商给出的模型名称' : '可以改成控制台里的其他模型 ID' },
        h('input', { className: 'db-input', list: listId, value: model, placeholder: vendor.models[0] || '模型名称', onChange: (e) => setModel(e.target.value), onBlur: () => { if (model !== (config.model || '')) saveEngine({ [section]: { model: model.trim() } }) } }),
        h('datalist', { id: listId }, vendor.models.map((name) => h('option', { key: name, value: name }))))) : null,
    children ? children({ vendor, config, needsKey }) : null)
}

function EnginePage() {
  const studio = useStudio()
  const { engine, saveEngine, toast, model } = studio
  const [testing, setTesting] = useState('')
  const [sample, setSample] = useState(null)

  if (!engine) return h('div', { className: 'db-skel' })
  if (engine.error) {
    return h(Empty, { icon: 'warning', title: '读取引擎配置失败', action: h(Btn, { kind: 'primary', onClick: studio.reloadEngine }, '重新读取') }, engine.error)
  }
  const { settings, catalog, tools, voices } = engine
  const name = (section) => catalog[section].find((item) => item.id === settings[section].vendor)?.name || ''
  const saveKey = async (id, value) => {
    const view = await saveEngine({ keys: { [id]: value } })
    if (view) toast('ok', value === null ? 'Key 已清除。' : 'Key 已保存在本机。')
  }
  const test = async (capability) => {
    setTesting(capability)
    try {
      const payload = await request('settings/test', { capability })
      if (capability === 'image') { setSample(normalizeRef(payload.asset)); toast('ok', `出图成功，用时 ${(payload.ms / 1000).toFixed(1)} 秒。`) }
      if (capability === 'text') toast('ok', `文本模型可用（${payload.model?.model || ''}），用时 ${(payload.ms / 1000).toFixed(1)} 秒。`)
      if (capability === 'tts') { playingAudio?.pause(); playingAudio = new Audio(mediaUrl(payload.asset)); playingAudio.play().catch(() => {}) }
    } catch (error) {
      toast('err', `测试没有通过：${error.message}`)
    } finally {
      setTesting('')
    }
  }
  const textReady = Boolean(model)
  const line = [
    ['text', '写剧本', model ? (model.via === 'harness' ? `Harness：${model.model}` : `${model.provider}：${model.model}`) : '未连接', textReady],
    ['image', '出图', settings.image.vendor === 'none' ? '本地草图' : name('image'), settings.image.vendor === 'none' || catalog.image.find((i) => i.id === settings.image.vendor)?.keyOptional || Boolean(settings.keys[catalog.image.find((i) => i.id === settings.image.vendor)?.key]?.set) || settings.image.vendor === 'custom'],
    ['video', '动态', name('video'), settings.video.vendor === 'local' ? tools.motion : Boolean(settings.keys[catalog.video.find((i) => i.id === settings.video.vendor)?.key]?.set)],
    ['tts', '配音', name('tts'), settings.tts.vendor === 'system' ? tools.systemVoice : settings.tts.vendor === 'custom' || Boolean(settings.keys.siliconflow?.set)],
    ['render', '合成', tools.ffmpeg ? `ffmpeg ${tools.ffmpegVersion}` : '未找到 ffmpeg', tools.ffmpeg],
  ]

  return h('div', { className: 'db-stack db-engine-page' },
    h('ol', { className: 'db-line', 'aria-label': '当前产线' }, line.map(([id, label, value, ready]) => h('li', { key: id, className: ready ? 'ok' : 'off' },
      h('button', { type: 'button', onClick: () => document.getElementById(`db-engine-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
        h('span', null, label), h('strong', null, value), h('i', null, ready ? '就绪' : '待配置'))))),

    h('section', { className: 'db-card', id: 'db-engine-keys' },
      h('header', { className: 'db-section-head' }, h('h2', null, 'API Key'), h('span', { className: 'db-muted' }, '每家只填一次，出图、视频、配音共用')),
      h('div', { className: 'db-keys' }, catalog.keys.map((entry) => h(KeyRow, { key: entry.id, entry, state: settings.keys[entry.id], onSave: saveKey }))),
      h('p', { className: 'db-note' }, `Key 只保存在这台电脑上（${engine.dataDir}/settings.json，仅本人可读），页面拿不到明文，也不会写进项目备份。生成时由本机后端直接请求对应的服务商。`)),

    h('div', { id: 'db-engine-image' }, h(VendorPicker, { section: 'image', title: '出图', intro: '关键帧与定妆照' }, ({ vendor, config, needsKey }) => h(Fragment, null,
      vendor.refs ? h('label', { className: 'db-checkline' }, h('input', { type: 'checkbox', checked: config.useRefs !== false, onChange: (e) => saveEngine({ image: { useRefs: e.target.checked } }) }), '出图时附带出镜角色的定妆照作为参考图') : null,
      vendor.id !== 'none' ? h('div', { className: 'db-row' },
        h(Btn, { icon: 'bolt', disabled: needsKey || Boolean(testing), busy: testing === 'image', onClick: () => test('image') }, testing === 'image' ? '正在出一张测试图' : '出一张测试图'),
        h('span', { className: 'db-muted' }, '会真实调用一次接口')) : null,
      sample ? h('div', { className: 'db-sample' }, h(Frame, { asset: sample, onOpen: () => studio.setLightbox({ items: [{ asset: sample, title: '测试图' }] }) }), h('span', { className: 'db-muted' }, '测试图：清晨的地铁站台')) : null))),

    h('div', { id: 'db-engine-video' }, h(VendorPicker, { section: 'video', title: '动态', intro: '让关键帧动起来' })),

    h('div', { id: 'db-engine-tts' }, h(VendorPicker, { section: 'tts', title: '配音', intro: '把台词读出来' }, ({ vendor, config, needsKey }) => h(Fragment, null,
      vendor.id === 'system' && !tools.systemVoice ? h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '这台电脑没有可用的系统语音（仅 macOS 支持），请改用云端配音。') : null,
      h('div', { className: 'db-form-row' },
        h(Field, { label: '默认音色' },
          vendor.id === 'system'
            ? h('select', { className: 'db-select', value: config.voice, onChange: (e) => saveEngine({ tts: { voice: e.target.value } }) }, h('option', { value: '' }, '系统默认'), voices.map((voice) => h('option', { key: voice.id, value: voice.id }, `${voice.id}（${voice.locale}）`)))
            : vendor.voices?.length
              ? h('select', { className: 'db-select', value: config.voice, onChange: (e) => saveEngine({ tts: { voice: e.target.value } }) }, vendor.voices.map((voice) => h('option', { key: voice, value: voice }, voice)))
              : h('input', { className: 'db-input', defaultValue: config.voice, placeholder: '音色名称', onBlur: (e) => saveEngine({ tts: { voice: e.target.value.trim() } }) })),
        vendor.id === 'system'
          ? h(Field, { label: `语速（每分钟 ${config.rate} 字）` }, h('input', { type: 'range', min: 140, max: 260, step: 5, value: config.rate, onChange: (e) => saveEngine({ tts: { rate: Number(e.target.value) } }) }))
          : h(Field, { label: `语速（${Number(config.speed || 1).toFixed(2)} 倍）` }, h('input', { type: 'range', min: 0.7, max: 1.5, step: 0.05, value: config.speed || 1, onChange: (e) => saveEngine({ tts: { speed: Number(e.target.value) } }) }))),
      h('div', { className: 'db-row' }, h(Btn, { icon: 'volume', disabled: needsKey || Boolean(testing), busy: testing === 'tts', onClick: () => test('tts') }, '试听'), h('span', { className: 'db-muted' }, '每个角色可以在角色页单独指定音色'))))),

    h('section', { className: 'db-card db-engine', id: 'db-engine-text' },
      h('header', { className: 'db-section-head' }, h('h2', null, '写剧本'), h('span', { className: 'db-muted' }, '大纲、角色、分集、分镜和发布文案')),
      engine.harness.available ? h('div', { className: 'db-vendors', role: 'radiogroup', 'aria-label': '文本模型来源' },
        h('button', { type: 'button', role: 'radio', 'aria-checked': settings.text.mode !== 'custom', className: 'db-vendor', onClick: () => saveEngine({ text: { mode: 'harness' } }) }, h('strong', null, '跟随 Harness'), h('small', { className: engine.harness.model ? 'ok' : '' }, engine.harness.model?.model || '还没有登录模型')),
        h('button', { type: 'button', role: 'radio', 'aria-checked': settings.text.mode === 'custom', className: 'db-vendor', onClick: () => saveEngine({ text: { mode: 'custom' } }) }, h('strong', null, '用自己的 Key'), h('small', null, 'DeepSeek / 智谱 / 硅基流动 / 自定义')))
        : h('p', { className: 'db-note' }, '现在是独立运行，没有 Harness 的模型可用，需要填自己的文本模型 Key。'),
      settings.text.mode === 'custom' || !engine.harness.available ? h(TextVendor) : null,
      h('div', { className: 'db-row' }, h(Btn, { icon: 'bolt', disabled: Boolean(testing), busy: testing === 'text', onClick: () => test('text') }, '测试连接'))),

    h('section', { className: 'db-card db-engine', id: 'db-engine-render' },
      h('header', { className: 'db-section-head' }, h('h2', null, '合成'), h('span', { className: 'db-muted' }, '在本机用 ffmpeg 拼接画面、字幕、配音和配乐')),
      tools.ffmpeg
        ? h('p', { className: 'db-done' }, h(Icon, { name: 'check', size: 16 }), `已找到 ffmpeg ${tools.ffmpegVersion}（${tools.ffmpegPath}），编码器 ${tools.encoder}${tools.subtitles ? '' : '；这个版本不带字幕滤镜，成片不会有字幕'}。`)
        : h('p', { className: 'db-warn' }, h(Icon, { name: 'warning', size: 15 }), '没有找到 ffmpeg。macOS 可以在终端运行 brew install ffmpeg，装好后回到这里。'),
      h(Field, { label: 'ffmpeg 路径', hint: '自动找不到时再填' }, h('input', { className: 'db-input', defaultValue: settings.render.ffmpegPath, placeholder: '/opt/homebrew/bin/ffmpeg', onBlur: (e) => { if (e.target.value.trim() !== settings.render.ffmpegPath) saveEngine({ render: { ffmpegPath: e.target.value.trim() } }) } })),
      h('p', { className: 'db-note' }, `项目、素材和成片保存在 ${engine.dataDir}`)))
}

function TextVendor() {
  const { engine, saveEngine } = useStudio()
  const config = engine.settings.text
  const vendors = engine.catalog.text
  const vendor = vendors.find((item) => item.id === config.vendor) || vendors[0]
  const [model, setModel] = useState(config.model || '')
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || '')
  useEffect(() => { setModel(config.model || ''); setBaseUrl(config.baseUrl || '') }, [config.vendor, config.model, config.baseUrl])
  const missing = !engine.settings.keys[vendor.key]?.set
  return h(Fragment, null,
    h('div', { className: 'db-form-row' },
      h(Field, { label: '服务商' }, h('select', { className: 'db-select', value: vendor.id, onChange: (e) => saveEngine({ text: { vendor: e.target.value, model: '', baseUrl: '' } }) }, vendors.map((item) => h('option', { key: item.id, value: item.id }, item.name)))),
      h(Field, { label: '模型' },
        h('input', { className: 'db-input', list: 'db-models-text', value: model, placeholder: vendor.models[0] || '模型名称', onChange: (e) => setModel(e.target.value), onBlur: () => { if (model !== (config.model || '')) saveEngine({ text: { model: model.trim() } }) } }),
        h('datalist', { id: 'db-models-text' }, vendor.models.map((name) => h('option', { key: name, value: name }))))),
    vendor.custom ? h(Field, { label: '接口地址（Base URL）', hint: '到 /v1 为止' }, h('input', { className: 'db-input', value: baseUrl, placeholder: 'https://example.com/v1', onChange: (e) => setBaseUrl(e.target.value), onBlur: () => { if (baseUrl !== (config.baseUrl || '')) saveEngine({ text: { baseUrl: baseUrl.trim() } }) } })) : null,
    missing ? h('p', { className: 'db-warn' }, h(Icon, { name: 'key', size: 15 }), `还没有填写${engine.catalog.keys.find((key) => key.id === vendor.key)?.name || ''}的 API Key。`,
      h('button', { type: 'button', className: 'db-link', onClick: () => document.getElementById(`db-key-${vendor.key}`)?.querySelector('input')?.focus() }, '现在填写')) : null)
}
