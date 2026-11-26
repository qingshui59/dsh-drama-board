/**
 * 映序 Studio（AI 短剧分镜台）的 Host 半区。
 *
 * 这里只做 Harness 相关的接线：
 *  1. 把后端（host/app.js）挂到 /drama-board/api 这个前缀上。
 *     用 handler 路由而不是 resource：resource 只接受 GET/HEAD，POST 会被宿主回 405。
 *  2. 文本生成复用 ctx.llm + agentDefaultModel（当前会话在用的模型），用户不需要另填 API Key。
 *
 * 项目数据、素材与引擎配置都在 ~/.dsh/drama-board/ 下：
 *   projects.json  工作区      settings.json  出图 / 视频 / 配音引擎配置（权限 600）
 *   media/<项目>/  图片、视频、配音与成片
 */
import os from 'node:os'
import path from 'node:path'
import { PREFIX, createApp } from './host/app.js'

const DATA_HOME = process.env.DSH_HOME
  || (process.env.DSH_PROFILE_DIR
    ? path.dirname(process.env.DSH_PROFILE_DIR)
    : path.join(os.homedir(), '.dsh'))
const DATA_ROOT = path.join(DATA_HOME, 'drama-board')

/** 当前默认模型（也就是会话正在用的模型）。 */
function modelSelection(ctx) {
  try {
    const selection = ctx.get('agentDefaultModel')?.currentSelection?.()
    if (!selection) return null
    return {
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort ? { reasoningEffort: selection.reasoningEffort } : {}),
    }
  } catch {
    return null
  }
}

/** 用 Harness 的模型服务调一次模型并收集文本。 */
async function complete(ctx, system, user, outerSignal) {
  const selection = modelSelection(ctx)
  if (!selection?.provider || !selection?.model) {
    throw Object.assign(new Error('还没有可用的模型：请先在「设置 → 模型」里登录 DeepSeek'), { status: 400 })
  }
  const llm = ctx.get('llm')
  if (!llm) throw new Error('当前环境没有可用的模型服务（llm）')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('生成超时（180 秒）')), 180_000)
  const onOuterAbort = () => controller.abort()
  outerSignal?.addEventListener('abort', onOuterAbort, { once: true })
  let text = ''
  let failure = null
  let truncated = false
  try {
    // 所有 call controls 都要在 prepareCall 里定好：适配器会校验 dispatch 时的配置与 prepare 时一致。
    const call = await llm.prepareCall({
      provider: selection.provider,
      model: selection.model,
      ...(selection.reasoningEffort ? { reasoningEffort: selection.reasoningEffort } : {}),
      temperature: 0.85,
    }, controller.signal)

    const options = {
      ...call.config,
      system,
      messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
      signal: controller.signal,
    }

    for await (const chunk of call.stream(options)) {
      if (chunk?.type === 'text-delta') text += chunk.text
      else if (chunk?.type === 'finish') {
        const kind = chunk.reason?.kind
        if (kind === 'max-tokens') truncated = true
        else if (kind === 'error' || kind === 'aborted') failure = chunk.reason?.failure ?? { message: kind }
      }
    }
  } catch (error) {
    const message = controller.signal.aborted ? '生成超时或已取消' : (error?.message || String(error))
    throw new Error(`模型调用失败：${message}`)
  } finally {
    clearTimeout(timer)
    outerSignal?.removeEventListener('abort', onOuterAbort)
  }
  if (failure) throw new Error(`模型调用失败：${failure.message || failure.code || '未知原因'}`)
  if (!text.trim()) throw new Error('模型没有返回任何内容，请重试')
  if (truncated) {
    throw Object.assign(
      new Error('模型输出被截断（达到单次输出上限）。可以把「集数」调小、一次少生成几集，或重试一次。'),
      { status: 502 },
    )
  }
  return text
}

export const inject = ['webServer']

export function apply(ctx) {
  let logger
  try {
    if (typeof ctx.logger === 'function') logger = ctx.logger('drama-board')
  } catch { /* 没有 logger 也能跑 */ }

  const app = createApp({
    root: DATA_ROOT,
    log: (line) => logger?.warn?.(line),
    harness: {
      model: () => modelSelection(ctx),
      complete: (system, user, signal) => complete(ctx, system, user, signal),
    },
  })

  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'prefix', path: PREFIX, handler: app.handle })
    app.boot()
    logger?.info?.(`已挂载 ${PREFIX}，数据目录：${DATA_ROOT}`)
    return () => {
      app.dispose()
      try { dispose() } catch { /* 已卸载 */ }
    }
  }, 'drama-board: http api')
}
