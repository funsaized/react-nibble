import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { __resetDevMenuForTests, __setDevSettingsForTests } from './devMenu.js'
import { __resetTelemetryForTests } from '@react-nibble/core'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({ ok: true })
})

afterEach(() => {
  __resetDevMenuForTests()
  __resetTelemetryForTests()
  vi.unstubAllGlobals()
  mockFetch.mockReset()
})

describe('initializeInspector', () => {
  test('registers dev menu item via DevSettings', async () => {
    const mockAddMenuItem = vi.fn()
    __setDevSettingsForTests({ addMenuItem: mockAddMenuItem })

    const { initializeInspector } = await import('./initialize.js')
    initializeInspector()
    expect(mockAddMenuItem).toHaveBeenCalledWith(
      'Toggle react-nibble Inspector',
      expect.any(Function)
    )
  })

  test('calling twice only registers once (idempotent)', async () => {
    const mockAddMenuItem = vi.fn()
    __setDevSettingsForTests({ addMenuItem: mockAddMenuItem })

    const { initializeInspector } = await import('./initialize.js')
    initializeInspector()
    initializeInspector()
    expect(mockAddMenuItem).toHaveBeenCalledTimes(1)
  })

  test('no-op when DevSettings is unavailable', async () => {
    __setDevSettingsForTests(null)
    const { initializeInspector } = await import('./initialize.js')
    expect(() => initializeInspector()).not.toThrow()
  })

  test('wires telemetry collector when telemetry option is provided', async () => {
    __setDevSettingsForTests(null)
    const { initializeInspector } = await import('./initialize.js')
    const { getTelemetry } = await import('@react-nibble/core')
    initializeInspector({ telemetry: { enabled: true } })
    const collector = getTelemetry()
    collector.record('inspector-opened')
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  test('skips telemetry when option not provided', async () => {
    __setDevSettingsForTests(null)
    const { initializeInspector } = await import('./initialize.js')
    initializeInspector()
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
