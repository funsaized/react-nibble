import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  registerDevMenu,
  __resetDevMenuForTests,
  __setDevSettingsForTests,
} from './devMenu.js'

afterEach(() => {
  __resetDevMenuForTests()
})

describe('registerDevMenu', () => {
  test('registers a menu item via DevSettings.addMenuItem', () => {
    const mockAddMenuItem = vi.fn()
    __setDevSettingsForTests({ addMenuItem: mockAddMenuItem })

    const handler = vi.fn()
    registerDevMenu('Toggle Inspector', handler)
    expect(mockAddMenuItem).toHaveBeenCalledWith('Toggle Inspector', handler)
  })

  test('calling twice with same label registers only once', () => {
    const mockAddMenuItem = vi.fn()
    __setDevSettingsForTests({ addMenuItem: mockAddMenuItem })

    const handler = vi.fn()
    registerDevMenu('Toggle Inspector', handler)
    registerDevMenu('Toggle Inspector', handler)
    expect(mockAddMenuItem).toHaveBeenCalledTimes(1)
  })

  test('different labels register separately', () => {
    const mockAddMenuItem = vi.fn()
    __setDevSettingsForTests({ addMenuItem: mockAddMenuItem })

    registerDevMenu('Item A', vi.fn())
    registerDevMenu('Item B', vi.fn())
    expect(mockAddMenuItem).toHaveBeenCalledTimes(2)
  })

  test('no-op when DevSettings is unavailable', () => {
    __setDevSettingsForTests(null)
    expect(() => registerDevMenu('Test', vi.fn())).not.toThrow()
  })
})
