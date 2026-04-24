import { describe, expect, test, vi } from 'vitest'

vi.mock('react-native', () => ({
  Clipboard: { setString: vi.fn() },
  Modal: 'Modal',
  Pressable: 'Pressable',
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (s: Record<string, unknown>) => s },
}))

describe('PickerDialog', () => {
  test('module exports the component', async () => {
    const mod = await import('./PickerDialog.js')
    expect(mod.PickerDialog).toBeDefined()
    expect(typeof mod.PickerDialog).toBe('function')
  })

  test('function accepts a single props argument', async () => {
    const { PickerDialog } = await import('./PickerDialog.js')
    expect(PickerDialog.length).toBe(1)
  })
})
