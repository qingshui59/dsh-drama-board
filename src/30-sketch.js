// 本地分镜草图：不接任何出图引擎也能先把画面位置占上、把整条流程跑通。
// 按景别决定人物大小，按影调取色，同一个镜头每次画出来都一样（用镜头 ID 做随机种子）。

function seededRandom(text) {
  let seed = 2166136261
  for (let i = 0; i < text.length; i += 1) { seed ^= text.charCodeAt(i); seed = Math.imul(seed, 16777619) }
  return () => {
    seed += 0x6d2b79f5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 人物剪影：头 + 肩 + 躯干。unit 是头的半径。 */
function drawFigure(ctx, x, baseY, unit, fill, rim) {
  ctx.save()
  ctx.translate(x, baseY)
  ctx.beginPath()
  ctx.arc(0, -unit * 6.3, unit, 0, Math.PI * 2)
  ctx.moveTo(-unit * 0.42, -unit * 5.4)
  ctx.lineTo(unit * 0.42, -unit * 5.4)
  ctx.quadraticCurveTo(unit * 2.1, -unit * 5.1, unit * 2.15, -unit * 3.6)
  ctx.lineTo(unit * 1.75, unit * 0.4)
  ctx.lineTo(-unit * 1.75, unit * 0.4)
  ctx.lineTo(-unit * 2.15, -unit * 3.6)
  ctx.quadraticCurveTo(-unit * 2.1, -unit * 5.1, -unit * 0.42, -unit * 5.4)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = Math.max(2, Math.min(7, unit * 0.07))
  ctx.strokeStyle = rim
  ctx.stroke()
  ctx.restore()
}

function renderSketch(project, shot, index) {
  const width = 720
  const height = 1280
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const random = seededRandom(shot.id)
  const look = LOOKS.find((item) => item.id === project.visual.look) || LOOKS[0]
  const [dark, mid, light] = look.colors

  // 背景：上方是墙或天，下方是带透视线的地面。
  const horizon = height * (0.52 + random() * 0.12)
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, dark)
  sky.addColorStop(1, mid)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, horizon)
  const ground = ctx.createLinearGradient(0, horizon, 0, height)
  ground.addColorStop(0, mid)
  ground.addColorStop(1, dark)
  ctx.fillStyle = ground
  ctx.fillRect(0, horizon, width, height - horizon)
  ctx.globalAlpha = 0.16
  ctx.strokeStyle = light
  ctx.lineWidth = 2
  const vanish = width * (0.3 + random() * 0.4)
  for (let i = -4; i <= 8; i += 1) {
    ctx.beginPath()
    ctx.moveTo(vanish, horizon)
    ctx.lineTo(i * width / 4, height)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // 主光：一团柔光，位置随镜头变化。
  const glowX = width * (0.2 + random() * 0.6)
  const glowY = horizon * (0.25 + random() * 0.4)
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * 0.9)
  glow.addColorStop(0, `${light}cc`)
  glow.addColorStop(0.25, `${light}44`)
  glow.addColorStop(1, `${light}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  // 人物：景别越近，人越大。
  const cast = castOf(project, shot)
  const count = Math.min(3, cast.length)
  const unitBySize = { 远景: 15, 全景: 42, 中景: 78, 近景: 128, 特写: 215 }
  const baseBySize = { 远景: horizon + 70, 全景: height * 0.9, 中景: height * 1.06, 近景: height * 1.28, 特写: height * 1.58 }
  const unit = unitBySize[shot.shotSize] || 78
  if (count === 0 && (shot.shotSize === '特写' || shot.shotSize === '近景')) {
    // 没有人物的近景多半是道具：画一个被光打亮的物件。
    const size = width * 0.34
    ctx.save()
    ctx.translate(width / 2, height * 0.56)
    ctx.rotate((random() - 0.5) * 0.5)
    ctx.fillStyle = `${dark}ee`
    ctx.strokeStyle = `${light}cc`
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.roundRect(-size / 2, -size * 0.32, size, size * 0.64, size * 0.12)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  for (let i = 0; i < count; i += 1) {
    const spread = count === 1 ? 0.5 : 0.24 + (0.52 * i) / (count - 1)
    const x = width * (spread + (random() - 0.5) * 0.06)
    const scale = count > 1 && i > 0 ? 0.86 + random() * 0.1 : 1
    drawFigure(ctx, x, baseBySize[shot.shotSize] || height, unit * scale, `${dark}f2`, `${light}aa`)
  }

  // 铅笔排线与颗粒，让它一眼看得出是草图。
  ctx.globalAlpha = 0.07
  ctx.strokeStyle = light
  ctx.lineWidth = 1.5
  for (let i = 0; i < 90; i += 1) {
    const x = random() * width
    const y = random() * height
    const length = 40 + random() * 120
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + length, y - length * 0.6)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.75)
  vignette.addColorStop(0, '#00000000')
  vignette.addColorStop(1, '#000000aa')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)

  // 左下角标注：这是草图，不是成片画面（避开顶部进度条和字幕区）。
  ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif'
  ctx.textBaseline = 'top'
  const label = `草图 ${pad2(index + 1)}　${shot.shotSize} / ${shot.camera}`
  const labelWidth = ctx.measureText(label).width
  ctx.fillStyle = '#00000088'
  ctx.beginPath()
  ctx.roundRect(28, height - 78, labelWidth + 32, 50, 12)
  ctx.fill()
  ctx.fillStyle = '#ffffffdd'
  ctx.fillText(label, 44, height - 66)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('草图绘制失败'))), 'image/jpeg', 0.86)
  })
}
