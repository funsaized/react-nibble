import { afterEach, describe, expect, test } from 'vitest'
import { __resetTestOverrides, __setTestOverrides, resolveDevServerBase } from './devServer.js'

afterEach(() => {
  __resetTestOverrides()
})

describe('resolveDevServerBase', () => {
  test('returns override when provided', () => {
    expect(resolveDevServerBase('http://192.168.1.10:19000/')).toBe('http://192.168.1.10:19000')
  })

  test('strips trailing slashes from override', () => {
    expect(resolveDevServerBase('http://localhost:8081///')).toBe('http://localhost:8081')
  })

  test('extracts base from scriptURL when available', () => {
    __setTestOverrides('ios', {
      SourceCode: {
        scriptURL: 'http://192.168.1.10:19000/index.bundle?platform=ios',
      },
    })
    expect(resolveDevServerBase()).toBe('http://192.168.1.10:19000')
  })

  test('falls back to localhost:8081 for iOS when no scriptURL', () => {
    __setTestOverrides('ios', null)
    expect(resolveDevServerBase()).toBe('http://localhost:8081')
  })

  test('falls back to 10.0.2.2:8081 for Android when no scriptURL', () => {
    __setTestOverrides('android', null)
    expect(resolveDevServerBase()).toBe('http://10.0.2.2:8081')
  })

  test('falls back to localhost:8081 for node environment', () => {
    __setTestOverrides('node', null)
    expect(resolveDevServerBase()).toBe('http://localhost:8081')
  })

  test('falls back to localhost:8081 for web platform', () => {
    __setTestOverrides('web', null)
    expect(resolveDevServerBase()).toBe('http://localhost:8081')
  })

  test('ignores malformed scriptURL and falls back to platform default', () => {
    __setTestOverrides('ios', {
      SourceCode: {
        scriptURL: 'not-a-valid-url',
      },
    })
    expect(resolveDevServerBase()).toBe('http://localhost:8081')
  })

  test('handles SourceCode with undefined scriptURL', () => {
    __setTestOverrides('ios', {
      SourceCode: { scriptURL: undefined },
    })
    expect(resolveDevServerBase()).toBe('http://localhost:8081')
  })

  test('handles empty NativeModules object', () => {
    __setTestOverrides('android', {})
    expect(resolveDevServerBase()).toBe('http://10.0.2.2:8081')
  })
})
