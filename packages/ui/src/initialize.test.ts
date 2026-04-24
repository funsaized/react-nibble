import { afterEach, describe, expect, test, vi } from 'vitest'
import { __resetDevMenuForTests, __setDevSettingsForTests } from './devMenu.js'

afterEach(() => {
  __resetDevMenuForTests()
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
})
