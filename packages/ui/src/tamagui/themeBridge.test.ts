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
})
