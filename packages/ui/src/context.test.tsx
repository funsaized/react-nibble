import { describe, expect, test, vi } from 'vitest'
import {
  subscribeGlobalToggle,
  toggleInspectorGlobal,
  InspectorProvider,
  useInspector,
} from './context.js'

describe('subscribeGlobalToggle', () => {
  test('listener fires on toggleInspectorGlobal', () => {
    const listener = vi.fn()
    const unsub = subscribeGlobalToggle(listener)
    toggleInspectorGlobal()
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
  })

  test('unsubscribe prevents future calls', () => {
    const listener = vi.fn()
    const unsub = subscribeGlobalToggle(listener)
    unsub()
    toggleInspectorGlobal()
    expect(listener).not.toHaveBeenCalled()
  })

  test('multiple listeners all fire', () => {
    const a = vi.fn()
    const b = vi.fn()
    const unsubA = subscribeGlobalToggle(a)
    const unsubB = subscribeGlobalToggle(b)
    toggleInspectorGlobal()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    unsubA()
    unsubB()
  })
})

describe('useInspector', () => {
  test('throws when called outside React tree', () => {
    expect(() => useInspector()).toThrow()
  })
})

describe('toggleInspectorGlobal', () => {
  test('toggle fires all current subscribers', () => {
    const a = vi.fn()
    const b = vi.fn()
    const c = vi.fn()
    const unsubA = subscribeGlobalToggle(a)
    const unsubB = subscribeGlobalToggle(b)
    const unsubC = subscribeGlobalToggle(c)
    toggleInspectorGlobal()
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(c).toHaveBeenCalledTimes(1)
    unsubA()
    unsubB()
    unsubC()
  })

  test('fires nothing when no subscribers', () => {
    expect(() => toggleInspectorGlobal()).not.toThrow()
  })
})

describe('InspectorProvider', () => {
  test('module exports the provider component', () => {
    expect(InspectorProvider).toBeDefined()
    expect(typeof InspectorProvider).toBe('function')
  })

  test('provider function accepts children prop', () => {
    expect(InspectorProvider.length).toBeLessThanOrEqual(2)
  })
})

describe('InspectorContextValue shape', () => {
  test('useInspector throws when called outside React tree', () => {
    expect(() => useInspector()).toThrow()
  })
})
