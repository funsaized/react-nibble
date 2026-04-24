import { describe, expect, test, vi } from 'vitest'

vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Platform: { OS: 'ios' },
}))

describe('OverlayLayer', () => {
  test('module exports the component', async () => {
    const mod = await import('./OverlayLayer.js')
    expect(mod.OverlayLayer).toBeDefined()
  })

  test('component is a memo wrapper', async () => {
    const { OverlayLayer } = await import('./OverlayLayer.js')
    expect(OverlayLayer.type).toBeDefined()
    expect(typeof OverlayLayer.type).toBe('function')
  })
})
