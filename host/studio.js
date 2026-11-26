/**
 * 本机制片：系统语音配音、镜头运镜动效、字幕与整集合成（ffmpeg）。
 * 全部在本机完成，不需要任何 API Key。
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { exists, findBinary, run, uid } from './util.js'

const FONT_CANDIDATES = [
  '/System/Library/Fonts/PingFang.ttc',
  '/System/Library/Fonts/STHeiti Medium.ttc',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
  '/Library/Fonts/Arial Unicode.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
  'C:\\Windows\\Fonts\\msyh.ttc',
]

/** 每种运镜对应的缩放与平移（zoompan 表达式，p 为 0→1 的缓动进度）。 */
function motionExpr(camera, frames) {
  const p = `((1-cos(PI*on/${Math.max(1, frames - 1)}))/2)`
  const cx = 'iw/2-(iw/zoom/2)'
  const cy = 'ih/2-(ih/zoom/2)'
  const spanX = '(iw-iw/zoom)'
  const spanY = '(ih-ih/zoom)'
  switch (camera) {
    case '推': return { z: `1+0.22*${p}`, x: cx, y: `${spanY}*0.42` }
    case '拉': return { z: `1.22-0.22*${p}`, x: cx, y: `${spanY}*0.42` }
    case '摇': return { z: '1.2', x: `${spanX}*${p}`, y: cy }
    case '移': return { z: '1.2', x: `${spanX}*(1-${p})`, y: cy }
    case '跟': return { z: `1.1+0.08*${p}`, x: `${spanX}*(0.3+0.4*${p})`, y: cy }
    case '升降': return { z: '1.2', x: cx, y: `${spanY}*(1-${p})` }
    default: return { z: `1+0.035*${p}`, x: cx, y: cy }
  }
}

const assTime = (seconds) => {
  const total = Math.max(0, seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`
}

/** 把一句台词切成适合竖屏的短字幕（每条不超过 maxChars 个字）。 */
export function splitSubtitle(text, maxChars = 12) {
  const clean = String(text || '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const parts = clean.split(/(?<=[。！？!?；;…，,、])/).map((part) => part.trim()).filter(Boolean)
  const cues = []
  let current = ''
  const flush = () => { if (current) { cues.push(current); current = '' } }
  for (const part of parts) {
    if ((current + part).length <= maxChars) { current += part; continue }
    flush()
    if (part.length <= maxChars) { current = part; continue }
    for (let i = 0; i < part.length; i += maxChars) {
      const slice = part.slice(i, i + maxChars)
      if (slice.length === maxChars || i + maxChars < part.length) cues.push(slice)
      else current = slice
    }
  }
  flush()
  // 字幕末尾不留逗号、顿号。
  return cues.map((cue) => cue.replace(/[，,、；;]+$/, '')).filter(Boolean)
}

export function createStudio({ root, media, getSettings }) {
  const workRoot = path.join(root, 'work')
  let toolCache = null
  let toolCacheAt = 0

  /** 探测本机工具；结果缓存 30 秒，方便用户装完 ffmpeg 后直接重试。 */
  async function tools(force = false) {
    if (!force && toolCache && Date.now() - toolCacheAt < 30_000) return toolCache
    const settings = await getSettings()
    const ffmpeg = await findBinary('ffmpeg', settings.render?.ffmpegPath || undefined)
    const ffprobe = ffmpeg ? await findBinary('ffprobe', path.join(path.dirname(ffmpeg), 'ffprobe')) : await findBinary('ffprobe')
    const say = process.platform === 'darwin' ? await findBinary('say') : null
    const afconvert = process.platform === 'darwin' ? await findBinary('afconvert') : null
    const afinfo = process.platform === 'darwin' ? await findBinary('afinfo') : null
    let encoder = null
    let ffmpegVersion = ''
    let filters = { ass: false, zoompan: false, drawtext: false }
    if (ffmpeg) {
      try {
        const { stdout } = await run(ffmpeg, ['-hide_banner', '-encoders'], { timeoutMs: 15_000 })
        encoder = / libx264 /.test(stdout) ? 'libx264' : / h264_videotoolbox /.test(stdout) ? 'h264_videotoolbox' : / mpeg4 /.test(stdout) ? 'mpeg4' : null
        const version = await run(ffmpeg, ['-version'], { timeoutMs: 15_000 })
        ffmpegVersion = (version.stdout.split('\n')[0] || '').replace(/^ffmpeg version\s+/, '').split(' ')[0]
        const list = (await run(ffmpeg, ['-hide_banner', '-filters'], { timeoutMs: 15_000 })).stdout
        filters = { ass: /\sass\s/.test(list), zoompan: /\szoompan\s/.test(list), drawtext: /\sdrawtext\s/.test(list) }
      } catch { /* 探测失败时按不可用处理 */ }
    }
    let fontFile = null
    for (const candidate of FONT_CANDIDATES) {
      if (await exists(candidate)) { fontFile = candidate; break }
    }
    toolCache = { ffmpeg, ffprobe, say, afconvert, afinfo, encoder, ffmpegVersion, filters, fontFile }
    toolCacheAt = Date.now()
    return toolCache
  }

  /** 系统自带的中文语音。 */
  async function voices() {
    const { say } = await tools()
    if (!say) return []
    try {
      const { stdout } = await run(say, ['-v', '?'], { timeoutMs: 15_000 })
      return stdout.split('\n').map((line) => {
        const match = /^(.+?)\s{2,}([a-z]{2}_[A-Z]{2})\s+#\s*(.*)$/.exec(line)
        return match ? { id: match[1].trim(), locale: match[2], sample: match[3] } : null
      }).filter((voice) => voice && voice.locale.startsWith('zh'))
    } catch {
      return []
    }
  }

  /** 读媒体时长与尺寸。 */
  async function probe(file) {
    const { ffprobe, afinfo } = await tools()
    if (ffprobe) {
      try {
        const { stdout } = await run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration:stream=width,height,codec_type', '-of', 'json', file], { timeoutMs: 30_000 })
        const data = JSON.parse(stdout)
        const video = (data.streams || []).find((stream) => stream.codec_type === 'video')
        return { duration: Number(data.format?.duration) || 0, width: video?.width || null, height: video?.height || null }
      } catch { /* 换下一种方式 */ }
    }
    if (afinfo) {
      try {
        const { stdout } = await run(afinfo, [file], { timeoutMs: 30_000 })
        const match = /estimated duration:\s*([\d.]+)/.exec(stdout)
        if (match) return { duration: Number(match[1]), width: null, height: null }
      } catch { /* 读不出时长 */ }
    }
    return { duration: 0, width: null, height: null }
  }

  async function workDir() {
    const dir = path.join(workRoot, uid('w'))
    await fs.mkdir(dir, { recursive: true })
    return dir
  }

  /** 用 macOS 系统语音把一句台词读成 m4a。 */
  async function speakLocal({ text, voice, rate, signal }) {
    const { say, afconvert } = await tools()
    if (!say || !afconvert) throw new Error('本机没有可用的系统语音（仅 macOS 支持）。请在「生成引擎 → 配音」里改用云端配音。')
    const dir = await workDir()
    try {
      const textFile = path.join(dir, 'line.txt')
      const aiff = path.join(dir, 'line.aiff')
      const out = path.join(dir, 'line.m4a')
      await fs.writeFile(textFile, text, 'utf8')
      const args = ['-f', textFile, '-o', aiff, '-r', String(Math.round(Math.max(90, Math.min(360, rate || 190))))]
      if (voice) args.unshift('-v', voice)
      await run(say, args, { signal, timeoutMs: 120_000 })
      await run(afconvert, ['-f', 'm4af', '-d', 'aac', aiff, out], { signal, timeoutMs: 120_000 })
      const buffer = await fs.readFile(out)
      const { duration } = await probe(out)
      return { buffer, mime: 'audio/mp4', duration }
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }

  function videoCodecArgs(encoder, quality = 'final') {
    if (encoder === 'libx264') return ['-c:v', 'libx264', '-preset', quality === 'final' ? 'medium' : 'veryfast', '-crf', quality === 'final' ? '20' : '18', '-pix_fmt', 'yuv420p']
    if (encoder === 'h264_videotoolbox') return ['-c:v', 'h264_videotoolbox', '-b:v', '8M', '-pix_fmt', 'yuv420p']
    return ['-c:v', 'mpeg4', '-q:v', '3', '-pix_fmt', 'yuv420p']
  }

  /**
   * 合成一集。
   * payload.shots: [{ image, video, audio, duration, camera, subtitle, label }]
   * payload.options: { width, height, fps, subtitles, fitAudio, title, bgm, bgmVolume }
   */
  async function renderEpisode(payload, { update, signal }) {
    const kit = await tools(true)
    if (!kit.ffmpeg) throw new Error('没有找到 ffmpeg。请先安装（macOS：brew install ffmpeg），或在「生成引擎 → 合成」里填写 ffmpeg 的完整路径。')
    if (!kit.encoder) throw new Error('这个 ffmpeg 不带 H.264 编码器，无法输出 MP4。')
    const shots = Array.isArray(payload.shots) ? payload.shots : []
    if (!shots.length) throw new Error('这一集还没有镜头，无法合成。')
    const options = payload.options || {}
    const width = [540, 720, 1080].includes(Number(options.width)) ? Number(options.width) : 720
    const height = Math.round(width * 16 / 9 / 2) * 2
    const fps = [24, 25, 30].includes(Number(options.fps)) ? Number(options.fps) : 30
    const dir = await workDir()
    try {
      // 第一步：算出每个镜头的实际时长（台词比镜头长时，把镜头延长到念完）。
      const plan = []
      for (const [index, shot] of shots.entries()) {
        let duration = Math.max(0.5, Math.min(60, Number(shot.duration) || 3))
        let audioPath = null
        let audioDuration = 0
        if (shot.audio) {
          const candidate = media.resolve(shot.audio)
          if (await exists(candidate)) {
            audioPath = candidate
            audioDuration = Number(shot.audio.dur) || (await probe(candidate)).duration
            if (options.fitAudio !== false && audioDuration + 0.35 > duration) duration = Math.round((audioDuration + 0.45) * 10) / 10
          }
        }
        const videoPath = shot.video && await exists(media.resolve(shot.video)) ? media.resolve(shot.video) : null
        const imagePath = shot.image && await exists(media.resolve(shot.image)) ? media.resolve(shot.image) : null
        plan.push({ index, duration, audioPath, audioDuration, videoPath, imagePath, camera: shot.camera, subtitle: shot.subtitle || '', label: shot.label || `镜头 ${index + 1}` })
      }
      const total = plan.reduce((sum, item) => sum + item.duration, 0)

      // 第二步：逐镜头生成统一规格的画面片段。
      const listLines = []
      for (const item of plan) {
        if (signal.aborted) throw Object.assign(new Error('已取消'), { canceled: true })
        update(0.05 + 0.6 * (item.index / plan.length), `镜头 ${item.index + 1} / ${plan.length}：生成画面`)
        const out = `seg-${String(item.index).padStart(3, '0')}.mp4`
        const frames = Math.max(1, Math.round(item.duration * fps))
        let args
        if (item.videoPath) {
          const clip = await probe(item.videoPath)
          const pad = Math.max(0, item.duration - (clip.duration || 0))
          const chain = [
            `scale=${width}:${height}:force_original_aspect_ratio=increase`, `crop=${width}:${height}`, 'setsar=1', `fps=${fps}`,
            ...(pad > 0.02 ? [`tpad=stop_mode=clone:stop_duration=${pad.toFixed(2)}`] : []),
          ].join(',')
          args = ['-y', '-v', 'error', '-i', item.videoPath, '-vf', chain, '-t', item.duration.toFixed(3), '-an']
        } else if (item.imagePath && kit.filters.zoompan) {
          const move = motionExpr(item.camera, frames)
          const chain = [
            `scale=${width * 2}:${height * 2}:force_original_aspect_ratio=increase`, `crop=${width * 2}:${height * 2}`, 'setsar=1',
            `zoompan=z='${move.z}':x='${move.x}':y='${move.y}':d=${frames}:s=${width}x${height}:fps=${fps}`,
          ].join(',')
          args = ['-y', '-v', 'error', '-i', item.imagePath, '-vf', chain, '-frames:v', String(frames), '-an']
        } else if (item.imagePath) {
          const chain = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`
          args = ['-y', '-v', 'error', '-loop', '1', '-framerate', String(fps), '-i', item.imagePath, '-vf', chain, '-t', item.duration.toFixed(3), '-an']
        } else {
          // 还没出图的镜头：用带镜号的占位画面顶上，时间线不会断。
          let chain = 'setsar=1'
          if (kit.filters.drawtext && kit.fontFile) {
            const textFile = `ph-${item.index}.txt`
            await fs.writeFile(path.join(dir, textFile), `${item.label}\n待出图`, 'utf8')
            const font = kit.fontFile.replace(/\\/g, '/').replace(/:/g, '\\:')
            chain += `,drawtext=fontfile='${font}':textfile=${textFile}:fontcolor=0x9aa6bd:fontsize=${Math.round(width / 15)}:line_spacing=${Math.round(width / 40)}:x=(w-text_w)/2:y=(h-text_h)/2`
          }
          args = ['-y', '-v', 'error', '-f', 'lavfi', '-i', `color=c=0x1a2030:s=${width}x${height}:r=${fps}:d=${item.duration.toFixed(3)}`, '-vf', chain, '-t', item.duration.toFixed(3), '-an']
        }
        await run(kit.ffmpeg, [...args, '-r', String(fps), ...videoCodecArgs(kit.encoder, 'segment'), out], { cwd: dir, signal })
        listLines.push(`file '${out}'`)
      }
      await fs.writeFile(path.join(dir, 'list.txt'), listLines.join('\n'), 'utf8')

      // 第三步：字幕（ASS）。每句台词按字数分配时间，贴着配音走。
      const wantSubtitles = options.subtitles !== false && kit.filters.ass
      const events = []
      const scale = width / 720
      let cursor = 0
      for (const item of plan) {
        const cues = splitSubtitle(item.subtitle)
        if (cues.length) {
          const lead = item.audioPath ? 0.15 : 0.1
          const span = item.audioPath ? Math.min(item.duration - lead, item.audioDuration + 0.2) : item.duration - lead - 0.1
          const chars = cues.reduce((sum, cue) => sum + cue.length, 0)
          let offset = cursor + lead
          for (const cue of cues) {
            const length = Math.max(0.5, span * cue.length / chars)
            events.push(`Dialogue: 0,${assTime(offset)},${assTime(Math.min(cursor + item.duration, offset + length))},Sub,,0,0,0,,${cue}`)
            offset += length
          }
        }
        cursor += item.duration
      }
      if (options.title) {
        const title = String(options.title).replace(/[{}\n\r]/g, ' ').slice(0, 24)
        events.unshift(`Dialogue: 1,${assTime(0.2)},${assTime(Math.min(3, total))},Title,,0,0,0,,{\\fad(300,400)}${title}`)
      }
      const useAss = wantSubtitles && events.length > 0
      if (useAss) {
        const ass = [
          '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${width}`, `PlayResY: ${height}`, 'WrapStyle: 2', 'ScaledBorderAndShadow: yes', '',
          '[V4+ Styles]',
          'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
          `Style: Sub,PingFang SC,${Math.round(52 * scale)},&H00FFFFFF,&H000000FF,&H00141414,&H96000000,-1,0,0,0,100,100,1,0,1,${(3 * scale).toFixed(1)},${(1.2 * scale).toFixed(1)},2,${Math.round(48 * scale)},${Math.round(48 * scale)},${Math.round(250 * scale)},1`,
          `Style: Title,PingFang SC,${Math.round(40 * scale)},&H00FFFFFF,&H000000FF,&H00141414,&H96000000,-1,0,0,0,100,100,2,0,1,${(2.4 * scale).toFixed(1)},${(1 * scale).toFixed(1)},8,${Math.round(48 * scale)},${Math.round(48 * scale)},${Math.round(150 * scale)},1`,
          '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
          ...events, '',
        ].join('\n')
        await fs.writeFile(path.join(dir, 'subs.ass'), ass, 'utf8')
      }

      // 第四步：拼接画面、叠字幕、混配音与配乐。
      update(0.68, '合成声音与字幕')
      const inputs = ['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-f', 'lavfi', '-t', total.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo']
      const graph = []
      const voiceLabels = ['[1:a]']
      let inputIndex = 2
      cursor = 0
      for (const item of plan) {
        if (item.audioPath) {
          inputs.push('-i', item.audioPath)
          const label = `[v${inputIndex}]`
          graph.push(`[${inputIndex}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round((cursor + 0.15) * 1000)}:all=1${label}`)
          voiceLabels.push(label)
          inputIndex += 1
        }
        cursor += item.duration
      }
      let audioOut = '[1:a]'
      if (voiceLabels.length > 1) {
        graph.push(`${voiceLabels.join('')}amix=inputs=${voiceLabels.length}:normalize=0:duration=first[voice]`)
        audioOut = '[voice]'
      }
      const bgmPath = options.bgm && await exists(media.resolve(options.bgm)) ? media.resolve(options.bgm) : null
      if (bgmPath) {
        inputs.push('-stream_loop', '-1', '-i', bgmPath)
        const volume = Math.max(0, Math.min(1, Number(options.bgmVolume ?? 0.22)))
        const fade = Math.min(1.5, total / 4)
        graph.push(`[${inputIndex}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${volume.toFixed(2)},atrim=0:${total.toFixed(3)},afade=t=out:st=${(total - fade).toFixed(3)}:d=${fade.toFixed(3)}[bgm]`)
        graph.push(`${audioOut}[bgm]amix=inputs=2:normalize=0:duration=first[mix]`)
        audioOut = '[mix]'
      }
      let videoOut = '0:v'
      if (useAss) {
        graph.push('[0:v]ass=subs.ass[vout]')
        videoOut = '[vout]'
      }
      const outFile = 'episode.mp4'
      const args = ['-y', '-v', 'error', '-nostats', '-progress', 'pipe:1', ...inputs]
      if (graph.length) args.push('-filter_complex', graph.join(';'))
      args.push('-map', videoOut, '-map', audioOut)
      if (useAss) args.push(...videoCodecArgs(kit.encoder, 'final'), '-r', String(fps))
      else args.push('-c:v', 'copy')
      args.push('-c:a', 'aac', '-b:a', '160k', '-t', total.toFixed(3), '-movflags', '+faststart', outFile)
      await run(kit.ffmpeg, args, {
        cwd: dir,
        signal,
        onStdout: (text) => {
          const match = /out_time_(?:us|ms)=(\d+)/.exec(text)
          if (match) update(0.7 + 0.28 * Math.min(1, Number(match[1]) / 1e6 / total), '合成成片')
        },
      })
      update(0.99, '保存成片')
      const asset = await media.adopt(payload.pid, path.join(dir, outFile), {
        kind: 'render', source: 'local', provider: 'ffmpeg', w: width, h: height, dur: Math.round(total * 10) / 10,
        target: payload.target || null, prompt: options.title || '',
      })
      return {
        asset,
        total: Math.round(total * 10) / 10,
        durations: plan.map((item) => item.duration),
        missingImages: plan.filter((item) => !item.imagePath && !item.videoPath).length,
        subtitles: useAss,
        voiced: voiceLabels.length - 1,
      }
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }

  /** 把首帧图片压成不超过 1080 宽的 JPEG：部分视频接口限制图片 5 MB 以内。 */
  async function shrinkImage(file, signal) {
    const { ffmpeg } = await tools()
    if (!ffmpeg) return null
    const dir = await workDir()
    try {
      const out = path.join(dir, 'frame.jpg')
      await run(ffmpeg, ['-y', '-v', 'error', '-i', file, '-vf', "scale='min(1080,iw)':-2", '-q:v', '3', '-frames:v', '1', out], { signal, timeoutMs: 60_000 })
      return await fs.readFile(out)
    } catch {
      return null
    } finally {
      await fs.rm(dir, { recursive: true, force: true })
    }
  }

  async function cleanWork() {
    await fs.rm(workRoot, { recursive: true, force: true })
  }

  return { tools, voices, probe, speakLocal, renderEpisode, shrinkImage, cleanWork }
}
