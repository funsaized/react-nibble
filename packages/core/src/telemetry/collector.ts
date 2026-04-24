import type { TelemetryOptions } from '../types.js'
import type { TelemetryEvent } from './types.js'

const DEFAULT_ENDPOINT = 'https://t.react-nibble.dev/collect'
const PKG_VERSION = '0.0.0'

let instance: TelemetryCollector | null = null
let noticePrinted = false

export class TelemetryCollector {
  private readonly enabled: boolean
  private readonly endpoint: string
  private readonly sessionId: string

  constructor(opts: TelemetryOptions = {}) {
    const envEnabled = typeof process !== 'undefined' && process.env?.['NIBBLE_TELEMETRY'] === '1'
    this.enabled = Boolean(opts.enabled ?? envEnabled)
    this.endpoint = opts.endpoint ?? DEFAULT_ENDPOINT
    this.sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)

    if (this.enabled && !noticePrinted) {
      noticePrinted = true
      // eslint-disable-next-line no-console
      console.info(
        'react-nibble telemetry enabled. See docs/telemetry.md to learn what is collected.'
      )
    }
  }

  record(event: TelemetryEvent['event'], extras: { editor?: string } = {}): void {
    if (!this.enabled) return

    const payload: TelemetryEvent = {
      event,
      ts: new Date().toISOString(),
      pkgVersion: PKG_VERSION,
      node: typeof process !== 'undefined' ? process.version : undefined,
      os: typeof process !== 'undefined' ? process.platform : undefined,
      editor: extras.editor,
      sessionId: this.sessionId,
    }

    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* fire-and-forget: never block the caller */
    })
  }
}

export function getTelemetry(opts?: TelemetryOptions): TelemetryCollector {
  if (!instance) instance = new TelemetryCollector(opts)
  return instance
}

export function __resetTelemetryForTests(): void {
  instance = null
  noticePrinted = false
}
