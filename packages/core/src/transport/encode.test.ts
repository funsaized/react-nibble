import { describe, expect, test } from 'vitest'
import { encodeOpenSource } from './encode.js'

describe('encodeOpenSource', () => {
  test('encodes Unix path correctly', () => {
    const result = encodeOpenSource({ file: '/home/user/src/App.tsx', line: 42, column: 12 })
    const params = new URLSearchParams(result)
    expect(params.get('file')).toBe('/home/user/src/App.tsx')
    expect(params.get('line')).toBe('42')
    expect(params.get('column')).toBe('12')
  })

  test('encodes Windows path without colon collision', () => {
    const result = encodeOpenSource({
      file: 'C:\\Users\\dev\\src\\App.tsx',
      line: 10,
      column: 5,
    })
    const params = new URLSearchParams(result)
    expect(params.get('file')).toBe('C:\\Users\\dev\\src\\App.tsx')
    expect(params.get('line')).toBe('10')
    expect(params.get('column')).toBe('5')
  })

  test('defaults column to 1 when omitted', () => {
    const result = encodeOpenSource({ file: '/src/App.tsx', line: 1 })
    const params = new URLSearchParams(result)
    expect(params.get('column')).toBe('1')
  })

  test('includes editor param when specified', () => {
    const result = encodeOpenSource({ file: '/src/App.tsx', line: 1 }, 'zed')
    const params = new URLSearchParams(result)
    expect(params.get('editor')).toBe('zed')
  })

  test('omits editor param when not specified', () => {
    const result = encodeOpenSource({ file: '/src/App.tsx', line: 1 })
    const params = new URLSearchParams(result)
    expect(params.has('editor')).toBe(false)
  })
})
