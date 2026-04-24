import { describe, expect, test, vi } from 'vitest'

vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Modal: 'Modal',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Clipboard: { setString: vi.fn() },
  Platform: { OS: 'ios' },
  useColorScheme: () => 'light',
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}))

describe('InspectorRoot', () => {
  test('module exports InspectorRoot and InspectorRootProps', async () => {
    const mod = await import('./InspectorRoot.js')
    expect(mod.InspectorRoot).toBeDefined()
    expect(typeof mod.InspectorRoot).toBe('function')
  })

  test('function accepts a single props argument', async () => {
    const { InspectorRoot } = await import('./InspectorRoot.js')
    expect(InspectorRoot.length).toBe(1)
  })
})
