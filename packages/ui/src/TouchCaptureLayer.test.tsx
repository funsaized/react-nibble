import { describe, expect, test, vi } from 'vitest'

vi.mock('react-native', () => ({
  View: 'View',
  Platform: { OS: 'ios' },
}))

describe('TouchCaptureLayer', () => {
  test('module exports the component and prop types', async () => {
    const mod = await import('./TouchCaptureLayer.js')
    expect(mod.TouchCaptureLayer).toBeDefined()
    expect(typeof mod.TouchCaptureLayer).toBe('object')
  })

  test('component is a forwardRef with correct displayName', async () => {
    const { TouchCaptureLayer } = await import('./TouchCaptureLayer.js')
    expect(TouchCaptureLayer.displayName ?? TouchCaptureLayer.render?.name).toBe(
      'TouchCaptureLayer'
    )
  })
})
