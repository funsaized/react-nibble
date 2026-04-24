import { describe, expect, test } from 'vitest'
import type { TamaguiConfig } from './themeBridge.js'
import { buildInspectorTheme, resolveInspectorTokens } from './themeBridge.js'

describe('buildInspectorTheme', () => {
  test('returns the host config unchanged (P1)', () => {
    const hostConfig: TamaguiConfig = { themes: { light: {}, dark: {} } }
    expect(buildInspectorTheme(hostConfig)).toBe(hostConfig)
  })
})

describe('resolveInspectorTokens', () => {
  test('light defaults differ from dark defaults', () => {
    const light = resolveInspectorTokens(undefined, false)
    const dark = resolveInspectorTokens(undefined, true)
    expect(light.overlayColor).not.toBe(dark.overlayColor)
    expect(light.overlayBorderColor).not.toBe(dark.overlayBorderColor)
    expect(light.accentColor).not.toBe(dark.accentColor)
  })

  test('overrides take precedence over defaults', () => {
    const out = resolveInspectorTokens({ overlayColor: 'red', accentColor: 'hotpink' }, true)
    expect(out.overlayColor).toBe('red')
    expect(out.accentColor).toBe('hotpink')
    expect(out.overlayBorderColor).toBeTruthy()
    expect(out.tagBackground).toBeTruthy()
  })

  test('returns all required keys', () => {
    const out = resolveInspectorTokens(undefined, false)
    const expectedKeys: (keyof typeof out)[] = [
      'overlayColor',
      'overlayBorderColor',
      'tagBackground',
      'tagForeground',
      'pickerBackground',
      'pickerForeground',
      'accentColor',
    ]
    for (const k of expectedKeys) expect(out[k]).toBeTruthy()
  })

  test('overlayColor alone overrides only that token', () => {
    const out = resolveInspectorTokens({ overlayColor: 'custom-overlay' }, false)
    expect(out.overlayColor).toBe('custom-overlay')
    expect(out.overlayBorderColor).toMatch(/^rgba/)
    expect(out.tagBackground).toMatch(/^rgba/)
    expect(out.tagForeground).toBe('#ffffff')
  })

  test('pickerBackground alone overrides only that token', () => {
    const out = resolveInspectorTokens({ pickerBackground: '#000' }, true)
    expect(out.pickerBackground).toBe('#000')
    expect(out.pickerForeground).toBe('#cccccc')
  })

  test('accentColor alone overrides only that token', () => {
    const out = resolveInspectorTokens({ accentColor: 'lime' }, false)
    expect(out.accentColor).toBe('lime')
    expect(out.overlayColor).toMatch(/^rgba/)
  })

  test('all overrides at once replaces all defaults', () => {
    const all = {
      overlayColor: 'a',
      overlayBorderColor: 'b',
      tagBackground: 'c',
      tagForeground: 'd',
      pickerBackground: 'e',
      pickerForeground: 'f',
      accentColor: 'g',
    }
    const out = resolveInspectorTokens(all, false)
    expect(out).toEqual(all)
  })

  test('dark mode picker defaults differ from light', () => {
    const light = resolveInspectorTokens(undefined, false)
    const dark = resolveInspectorTokens(undefined, true)
    expect(light.pickerBackground).not.toBe(dark.pickerBackground)
    expect(light.pickerForeground).not.toBe(dark.pickerForeground)
    expect(light.tagBackground).not.toBe(dark.tagBackground)
  })
})
