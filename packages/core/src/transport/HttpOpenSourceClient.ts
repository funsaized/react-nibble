import type { OpenSourceClient, SourceLocation } from '../types.js'
import { resolveDevServerBase } from './devServer.js'
import { encodeOpenSource } from './encode.js'

export interface HttpOpenSourceClientOptions {
  endpoint?: string
  devServerUrl?: string
  editor?: string
  timeoutMs?: number
}

export class HttpOpenSourceClient implements OpenSourceClient {
  private readonly opts: HttpOpenSourceClientOptions

  constructor(opts: HttpOpenSourceClientOptions = {}) {
    this.opts = opts
  }

  async openSource(location: SourceLocation): Promise<void> {
    const base = resolveDevServerBase(this.opts.devServerUrl)
    const endpoint = this.opts.endpoint ?? '/__nibble/open-source'
    const url = `${base}${endpoint}?${encodeOpenSource(location, this.opts.editor)}`

    const controller = new AbortController()
    const timeout = this.opts.timeoutMs ?? 5000
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, { method: 'GET', signal: controller.signal })
      if (!res.ok) {
        let body: { error?: string } = {}
        try {
          body = (await res.json()) as { error?: string }
        } catch {
          // non-JSON body
        }
        throw new Error(
          body.error
            ? `react-nibble: ${body.error} (${res.status})`
            : `react-nibble: dev server returned ${res.status}`
        )
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(
          `react-nibble: dev server unreachable at ${base} (timeout after ${timeout}ms)`
        )
      }
      if (err instanceof TypeError) {
        throw new Error(`react-nibble: dev server unreachable at ${base} (${err.message})`)
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }

  async ping(): Promise<boolean> {
    const base = resolveDevServerBase(this.opts.devServerUrl)
    const url = `${base}/__nibble/health`
    try {
      const res = await fetch(url, { method: 'GET' })
      return res.ok
    } catch {
      return false
    }
  }
}
