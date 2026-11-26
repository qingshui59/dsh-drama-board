/**
 * 后台任务队列：出图、图生视频、配音、合成都比较慢，统一排队执行，页面轮询进度。
 * 任务结果在页面确认（ack）前一直保留，所以中途刷新页面不会丢结果。
 */
import { uid } from './util.js'

const LIMITS = { image: 2, video: 2, tts: 1, render: 1 }
const KEEP_MS = 24 * 60 * 60 * 1000

export function createJobs({ handlers, log }) {
  /** @type {Map<string, any>} */
  const jobs = new Map()
  const running = { image: 0, video: 0, tts: 0, render: 0 }

  const publicView = (job) => ({
    id: job.id, type: job.type, pid: job.pid, target: job.target, label: job.label,
    status: job.status, progress: job.progress, message: job.message,
    result: job.result, error: job.error,
    createdAt: job.createdAt, startedAt: job.startedAt, finishedAt: job.finishedAt,
  })

  function prune() {
    const now = Date.now()
    for (const [id, job] of jobs) {
      const finished = job.status === 'done' || job.status === 'error' || job.status === 'canceled'
      if (finished && (job.acked || now - (job.finishedAt || now) > KEEP_MS)) jobs.delete(id)
    }
  }

  function pump() {
    for (const job of jobs.values()) {
      if (job.status !== 'queued') continue
      if (running[job.type] >= (LIMITS[job.type] || 1)) continue
      start(job)
    }
  }

  function start(job) {
    running[job.type] += 1
    job.status = 'running'
    job.startedAt = Date.now()
    job.message = '开始处理'
    const update = (progress, message) => {
      if (Number.isFinite(progress)) job.progress = Math.max(0, Math.min(1, progress))
      if (message) job.message = message
    }
    Promise.resolve()
      .then(() => handlers[job.type](job.payload, { update, signal: job.controller.signal, job }))
      .then((result) => {
        job.status = 'done'
        job.progress = 1
        job.result = result
        job.message = '完成'
      })
      .catch((error) => {
        if (job.controller.signal.aborted || error?.canceled) {
          job.status = 'canceled'
          job.message = '已取消'
        } else {
          job.status = 'error'
          job.error = error?.message || String(error)
          job.message = '失败'
          log?.(`任务失败 ${job.type} ${job.label || ''}：${job.error}`)
        }
      })
      .finally(() => {
        job.finishedAt = Date.now()
        job.payload = null
        running[job.type] -= 1
        pump()
      })
  }

  return {
    create({ type, pid, target, label, payload }) {
      if (!handlers[type]) throw Object.assign(new Error(`不支持的任务类型：${type}`), { status: 400 })
      prune()
      const job = {
        id: uid('j'), type, pid, target: target || null, label: label || '', payload,
        status: 'queued', progress: 0, message: '排队中', result: null, error: null,
        createdAt: Date.now(), startedAt: null, finishedAt: null,
        controller: new AbortController(), acked: false,
      }
      jobs.set(job.id, job)
      pump()
      return publicView(job)
    },
    list() {
      prune()
      return Array.from(jobs.values()).filter((job) => !job.acked).map(publicView)
    },
    cancel(ids) {
      for (const id of ids) {
        const job = jobs.get(id)
        if (!job) continue
        if (job.status === 'queued') {
          job.status = 'canceled'
          job.message = '已取消'
          job.finishedAt = Date.now()
          job.payload = null
        } else if (job.status === 'running') {
          job.controller.abort()
        }
      }
    },
    ack(ids) {
      for (const id of ids) {
        const job = jobs.get(id)
        if (job && job.status !== 'queued' && job.status !== 'running') job.acked = true
      }
      prune()
    },
    stop() {
      for (const job of jobs.values()) {
        if (job.status === 'running') job.controller.abort()
        if (job.status === 'queued') job.status = 'canceled'
      }
    },
  }
}
