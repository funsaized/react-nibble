import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { __resetTestOverrides, __setTestOverrides } from './devServer.js'
import { HttpOpenSourceClient } from './HttpOpenSourceClient.js'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  __setTestOverrides('node', null)
})

afterEach(() => {
  vi.unstubAllGlobals()
  __resetTestOverrides()
  mockFetch.mockReset()
})

const loc = { file: '/src/App.tsx', line: 42, column: 1 }

describe('HttpOpenSourceClient.openSource', () => {
  test('resolves on 200 response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.openSource(loc)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledOnce()
    const calledUrl = mockFetch.mock.calls[0]![0] as string
    expect(calledUrl).toContain('/__nibble/open-source?')
    expect(calledUrl).toContain('file=%2Fsrc%2FApp.tsx')
  })

  test('rejects with error body on 403', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ error: 'path outside allowed roots' }),
    })
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.openSource(loc)).rejects.toThrow(
      'react-nibble: path outside allowed roots (403)'
    )
  })

  test('rejects with status on 404 (non-JSON body)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.reject(new Error('not json')),
    })
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.openSource(loc)).rejects.toThrow(
      'react-nibble: dev server returned 404'
    )
  })

  test('rejects with unreachable on network error (TypeError)', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.openSource(loc)).rejects.toThrow(
      'react-nibble: dev server unreachable at http://localhost:8081 (fetch failed)'
    )
  })

  test('rejects with timeout on AbortError', async () => {
    mockFetch.mockImplementationOnce(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            const err = new DOMException('aborted', 'AbortError')
            reject(err)
          })
        })
    )
    const client = new HttpOpenSourceClient({
      devServerUrl: 'http://localhost:8081',
      timeoutMs: 50,
    })
    await expect(client.openSource(loc)).rejects.toThrow(
      'react-nibble: dev server unreachable at http://localhost:8081 (timeout after 50ms)'
    )
  })

  test('uses custom endpoint', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const client = new HttpOpenSourceClient({
      devServerUrl: 'http://localhost:8081',
      endpoint: '/custom/open',
    })
    await client.openSource(loc)
    const calledUrl = mockFetch.mock.calls[0]![0] as string
    expect(calledUrl).toContain('/custom/open?')
  })

  test('includes editor query param', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const client = new HttpOpenSourceClient({
      devServerUrl: 'http://localhost:8081',
      editor: 'zed',
    })
    await client.openSource(loc)
    const calledUrl = mockFetch.mock.calls[0]![0] as string
    expect(calledUrl).toContain('editor=zed')
  })
})

describe('HttpOpenSourceClient.ping', () => {
  test('returns true on 200', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.ping()).resolves.toBe(true)
    const calledUrl = mockFetch.mock.calls[0]![0] as string
    expect(calledUrl).toBe('http://localhost:8081/__nibble/health')
  })

  test('returns false on network error', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.ping()).resolves.toBe(false)
  })

  test('returns false on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const client = new HttpOpenSourceClient({ devServerUrl: 'http://localhost:8081' })
    await expect(client.ping()).resolves.toBe(false)
  })
})
