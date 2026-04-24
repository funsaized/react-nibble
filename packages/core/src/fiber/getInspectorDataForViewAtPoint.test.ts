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
})
