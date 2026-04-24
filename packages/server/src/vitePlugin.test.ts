import { createServer, type ViteDevServer } from 'vite'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { nibbleVitePlugin } from './vitePlugin.js'

function randomPort(): number {
  return 40000 + Math.floor(Math.random() * 20000)
}

describe('nibbleVitePlugin integration', () => {
  let server: ViteDevServer
  let launchCalls: Array<{ file: string; line: number; column: number }>

  beforeEach(async () => {
    launchCalls = []
    server = await createServer({
      configFile: false,
      root: process.cwd(),
      server: { port: randomPort(), strictPort: false, host: '127.0.0.1' },
      logLevel: 'silent',
      plugins: [
        nibbleVitePlugin({
          editor: 'code',
          allowedRoots: [process.cwd()],
          onLaunch: async ({ file, line, column }) => {
            launchCalls.push({ file, line, column })
          },
        }),
      ],
    })
    await server.listen()
  })

  afterEach(async () => {
    await server?.close()
  })

  function baseUrl(): string {
    const local = server.resolvedUrls?.local[0]
    if (local) return local.replace(/\/$/, '')
    const addr = server.httpServer?.address()
    if (addr && typeof addr === 'object') {
      return `http://127.0.0.1:${addr.port}`
    }
    throw new Error('no server address')
  }

  test('GET /__nibble/health returns ok with version + editor', async () => {
    const res = await fetch(`${baseUrl()}/__nibble/health`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; editor: string | null }
    expect(body.ok).toBe(true)
    expect(body.editor).toBe('code')
  })

  test('GET /__nibble/open-source happy path invokes onLaunch', async () => {
    const here = import.meta.url.startsWith('file://')
      ? import.meta.url.replace('file://', '')
      : process.cwd() + '/dummy'
    const res = await fetch(
      `${baseUrl()}/__nibble/open-source?file=${encodeURIComponent(here)}&line=1&column=1`
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
    expect(launchCalls).toHaveLength(1)
  })

  test('GET /__nibble/open-source path traversal is denied', async () => {
    const res = await fetch(`${baseUrl()}/__nibble/open-source?file=/etc/passwd&line=1&column=1`)
    expect(res.status).toBe(403)
    expect(launchCalls).toHaveLength(0)
  })

  test('GET /__nibble/open-source with missing params is 400', async () => {
    const res = await fetch(`${baseUrl()}/__nibble/open-source?file=&line=&column=`)
    expect(res.status).toBe(400)
  })

  test('other routes fall through to Vite 404', async () => {
    const res = await fetch(`${baseUrl()}/some/unknown/path`)
    expect(res.status).toBe(404)
  })
})
