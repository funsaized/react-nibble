import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { __resetTelemetryForTests, getTelemetry, TelemetryCollector } from './collector.js'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({ ok: true })
})

afterEach(() => {
  __resetTelemetryForTests()
  vi.unstubAllGlobals()
  mockFetch.mockReset()
  delete process.env['NIBBLE_TELEMETRY']
})

describe('TelemetryCollector', () => {
  test('disabled by default — no fetch call on record()', () => {
    const collector = new TelemetryCollector()
    collector.record('inspector-opened')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('enabled via opts — fetch called with correct payload', async () => {
    const collector = new TelemetryCollector({ enabled: true })
    collector.record('editor-launched', { editor: 'zed' })

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0]!
    expect(url).toBe('https://t.react-nibble.dev/collect')
    expect(init.method).toBe('POST')

    const body = JSON.parse(init.body as string) as Record<string, unknown>
    expect(body['event']).toBe('editor-launched')
    expect(body['editor']).toBe('zed')
    expect(body['pkgVersion']).toBe('0.0.0')
    expect(body['sessionId']).toBeDefined()
    expect(body['ts']).toBeDefined()

    expect(body).not.toHaveProperty('file')
    expect(body).not.toHaveProperty('componentName')
    expect(body).not.toHaveProperty('ip')
    expect(body).not.toHaveProperty('pid')
  })

  test('enabled via env NIBBLE_TELEMETRY=1', () => {
    process.env['NIBBLE_TELEMETRY'] = '1'
    const collector = new TelemetryCollector()
    collector.record('component-tapped')
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  test('record() never throws even if fetch rejects', () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'))
    const collector = new TelemetryCollector({ enabled: true })
    expect(() => collector.record('editor-launch-failed')).not.toThrow()
  })

  test('uses custom endpoint when provided', () => {
    const collector = new TelemetryCollector({
      enabled: true,
      endpoint: 'https://custom.example.com/telemetry',
    })
    collector.record('inspector-opened')
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url] = mockFetch.mock.calls[0]!
    expect(url).toBe('https://custom.example.com/telemetry')
  })

  test('payload event field matches allowed set', () => {
    const collector = new TelemetryCollector({ enabled: true })
    const validEvents: Array<'inspector-opened' | 'component-tapped' | 'editor-launched' | 'editor-launch-failed'> = [
      'inspector-opened',
      'component-tapped',
      'editor-launched',
      'editor-launch-failed',
    ]
    for (const event of validEvents) {
      mockFetch.mockClear()
      collector.record(event)
      expect(mockFetch).toHaveBeenCalledOnce()
      const body = JSON.parse((mockFetch.mock.calls[0]![1] as { body: string }).body) as Record<string, unknown>
      expect(body['event']).toBe(event)
    }
  })
})

describe('getTelemetry', () => {
  test('returns singleton instance', () => {
    const a = getTelemetry()
    const b = getTelemetry()
    expect(a).toBe(b)
  })

  test('respects opts on first call', () => {
    const collector = getTelemetry({ enabled: true })
    collector.record('inspector-opened')
    expect(mockFetch).toHaveBeenCalledOnce()
  })
})
