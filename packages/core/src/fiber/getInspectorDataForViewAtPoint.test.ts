import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  __resetCacheForTests,
  __setResolverForTests,
  getInspectorDataForViewAtPoint,
  type GetInspectorDataForViewAtPointFn,
} from './getInspectorDataForViewAtPoint.js'

const NEW_ARCH_PATH =
  'react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint'
const OLD_ARCH_PATH = 'react-native/Libraries/Inspector/getInspectorDataForViewAtPoint'

afterEach(() => {
  __resetCacheForTests()
  __setResolverForTests(null)
})

describe('getInspectorDataForViewAtPoint', () => {
  test('returns new-arch path when available', () => {
    const stub: GetInspectorDataForViewAtPointFn = vi.fn()
    __setResolverForTests((path) => (path === NEW_ARCH_PATH ? stub : null))
    const result = getInspectorDataForViewAtPoint()
    expect(result).toBe(stub)
  })

  test('falls back to old-arch path when new-arch is unavailable', () => {
    const stub: GetInspectorDataForViewAtPointFn = vi.fn()
    __setResolverForTests((path) => (path === OLD_ARCH_PATH ? stub : null))
    const result = getInspectorDataForViewAtPoint()
    expect(result).toBe(stub)
  })

  test('prefers new-arch over old-arch when both available', () => {
    const newArchFn: GetInspectorDataForViewAtPointFn = vi.fn()
    const oldArchFn: GetInspectorDataForViewAtPointFn = vi.fn()
    __setResolverForTests((path) => {
      if (path === NEW_ARCH_PATH) return newArchFn
      if (path === OLD_ARCH_PATH) return oldArchFn
      return null
    })
    const result = getInspectorDataForViewAtPoint()
    expect(result).toBe(newArchFn)
  })

  test('returns null when both paths fail', () => {
    __setResolverForTests(() => null)
    expect(getInspectorDataForViewAtPoint()).toBeNull()
  })

  test('caches result after first call', () => {
    __setResolverForTests(() => null)
    const first = getInspectorDataForViewAtPoint()
    const second = getInspectorDataForViewAtPoint()
    expect(first).toBeNull()
    expect(first).toBe(second)
  })

  test('cached null prevents subsequent resolver calls', () => {
    let callCount = 0
    __setResolverForTests(() => {
      callCount++
      return null
    })
    getInspectorDataForViewAtPoint()
    expect(callCount).toBe(2)

    const stub: GetInspectorDataForViewAtPointFn = vi.fn()
    __setResolverForTests(() => stub)
    expect(getInspectorDataForViewAtPoint()).toBeNull()
    expect(callCount).toBe(2)
  })

  test('resolves default export from module', () => {
    const fn: GetInspectorDataForViewAtPointFn = vi.fn()
    __setResolverForTests((path) => (path === NEW_ARCH_PATH ? fn : null))
    expect(getInspectorDataForViewAtPoint()).toBe(fn)
  })

  test('falls through to old-arch when new-arch resolver returns null', () => {
    const oldFn: GetInspectorDataForViewAtPointFn = vi.fn()
    const resolveCallPaths: string[] = []
    __setResolverForTests((path) => {
      resolveCallPaths.push(path)
      if (path === OLD_ARCH_PATH) return oldFn
      return null
    })
    const result = getInspectorDataForViewAtPoint()
    expect(result).toBe(oldFn)
    expect(resolveCallPaths).toEqual([NEW_ARCH_PATH, OLD_ARCH_PATH])
  })
})
