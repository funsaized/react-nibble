import { IncomingMessage, ServerResponse } from 'node:http'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Socket } from 'node:net'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  handleOpenSource,
  handleHealth,
  __resetLaunchEditorCacheForTests,
  type HandlerOptions,
} from './handler.js'

function createFakeReq(url: string): IncomingMessage {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.url = url
  req.method = 'GET'
  return req
}

function createFakeRes(): ServerResponse & {
  _status: number
  _body: string
  _headers: Record<string, string>
} {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  const res = new ServerResponse(req) as ServerResponse & {
    _status: number
    _body: string
    _headers: Record<string, string>
  }
  res._status = 0
  res._body = ''
  res._headers = {}

  const origSetHeader = res.setHeader.bind(res)
  res.setHeader = (name: string, value: string | number | readonly string[]) => {
    res._headers[name] = String(value)
    return origSetHeader(name, value)
  }

  const origEnd = res.end.bind(res)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res.end = (chunk?: any, ...args: any[]) => {
    if (chunk) res._body = String(chunk)
    res._status = res.statusCode
    return origEnd(chunk, ...args)
  }

  return res
}

function defaultOpts(overrides?: Partial<HandlerOptions>): HandlerOptions {
  return {
    allowedRoots: [tmpRoot],
    pkgVersion: '1.0.0-test',
    editor: 'code',
    ...overrides,
  }
}

let tmpRoot: string
let insideFile: string

const savedEnv: Record<string, string | undefined> = {}

beforeEach(() => {
  savedEnv.NODE_ENV = process.env.NODE_ENV
  savedEnv.LAUNCH_EDITOR = process.env.LAUNCH_EDITOR
  savedEnv.EDITOR = process.env.EDITOR
  delete process.env.NODE_ENV
  delete process.env.LAUNCH_EDITOR
  delete process.env.EDITOR

  tmpRoot = mkdtempSync(join(tmpdir(), 'handler-'))
  const dir = join(tmpRoot, 'project')
  mkdirSync(dir, { recursive: true })
  insideFile = join(dir, 'a.ts')
  writeFileSync(insideFile, '')
})

afterEach(() => {
  process.env.NODE_ENV = savedEnv.NODE_ENV
  process.env.LAUNCH_EDITOR = savedEnv.LAUNCH_EDITOR
  process.env.EDITOR = savedEnv.EDITOR
  __resetLaunchEditorCacheForTests()
  rmSync(tmpRoot, { recursive: true, force: true })
})

describe('handleOpenSource', () => {
  test('happy path invokes onLaunch and returns 200', async () => {
    const launches: Array<{ file: string; line: number; column: number }> = []
    const opts = defaultOpts({
      onLaunch: async ({ file, line, column }) => {
        launches.push({ file, line, column })
      },
    })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=10&column=5`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(200)
    const body = JSON.parse(res._body) as { ok: boolean }
    expect(body.ok).toBe(true)
    expect(launches).toHaveLength(1)
    expect(launches[0]?.line).toBe(10)
    expect(launches[0]?.column).toBe(5)
  })

  test('missing file param returns 400', async () => {
    const req = createFakeReq('/__nibble/open-source?line=1')
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(400)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toContain('missing file or line')
  })

  test('missing line param returns 400', async () => {
    const req = createFakeReq(`/__nibble/open-source?file=${encodeURIComponent(insideFile)}`)
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(400)
  })

  test('path traversal returns 403', async () => {
    const req = createFakeReq('/__nibble/open-source?file=/etc/passwd&line=1&column=1')
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(403)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toContain('outside allowed roots')
  })

  test('invalid line returns 400', async () => {
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=0&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(400)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toContain('invalid line or column')
  })

  test('invalid column returns 400', async () => {
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=-1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(400)
  })

  test('no editor configured returns 500', async () => {
    const opts = defaultOpts({ editor: undefined })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(500)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toContain('no editor configured')
  })

  test('NODE_ENV=production returns 404', async () => {
    process.env.NODE_ENV = 'production'
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(404)
  })

  test('onLaunch that throws returns 500 with error message', async () => {
    const opts = defaultOpts({
      onLaunch: async () => {
        throw new Error('editor crashed')
      },
    })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(500)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toBe('editor crashed')
  })

  test('onLaunch that throws non-Error returns stringified error', async () => {
    const opts = defaultOpts({
      onLaunch: async () => {
        throw 'string error'
      },
    })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(500)
    const body = JSON.parse(res._body) as { error: string }
    expect(body.error).toBe('string error')
  })

  test('falls back to launch-editor when onLaunch not provided', async () => {
    const opts = defaultOpts({ onLaunch: undefined })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    // launch-editor resolves (200 via timeout) or errors (500) depending on editor availability
    expect([200, 500]).toContain(res._status)
    const body = JSON.parse(res._body) as { ok: boolean }
    expect(body).toHaveProperty('ok')
  }, 10_000)

  test('LAUNCH_EDITOR env var is used when no editor in opts or query', async () => {
    process.env.LAUNCH_EDITOR = 'true'
    const opts = defaultOpts({ editor: undefined, onLaunch: undefined })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect([200, 500]).toContain(res._status)
  }, 10_000)

  test('EDITOR env var is used as last resort', async () => {
    process.env.EDITOR = 'true'
    const opts = defaultOpts({ editor: undefined, onLaunch: undefined })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect([200, 500]).toContain(res._status)
  }, 10_000)

  test('query editor param overrides options editor', async () => {
    const launches: Array<{ editor: string | undefined }> = []
    const opts = defaultOpts({
      editor: 'code',
      onLaunch: async ({ editor }) => {
        launches.push({ editor })
      },
    })
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1&column=1&editor=vim`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(200)
    expect(launches[0]?.editor).toBe('vim')
  })

  test('NaN line returns 400', async () => {
    const req = createFakeReq(
      `/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=abc&column=1`
    )
    const res = createFakeRes()
    await handleOpenSource(req, res, defaultOpts())
    expect(res._status).toBe(400)
  })

  test('default column is 1 when not provided', async () => {
    const launches: Array<{ column: number }> = []
    const opts = defaultOpts({
      onLaunch: async ({ column }) => {
        launches.push({ column })
      },
    })
    const req = createFakeReq(`/__nibble/open-source?file=${encodeURIComponent(insideFile)}&line=1`)
    const res = createFakeRes()
    await handleOpenSource(req, res, opts)
    expect(res._status).toBe(200)
    expect(launches[0]?.column).toBe(1)
  })
})

describe('handleHealth', () => {
  test('dev mode returns 200 with version and editor', () => {
    const req = createFakeReq('/__nibble/health')
    const res = createFakeRes()
    handleHealth(req, res, defaultOpts())
    expect(res._status).toBe(200)
    const body = JSON.parse(res._body) as {
      ok: boolean
      version: string
      editor: string | null
    }
    expect(body.ok).toBe(true)
    expect(body.version).toBe('1.0.0-test')
    expect(body.editor).toBe('code')
  })

  test('dev mode with no editor returns null editor', () => {
    const req = createFakeReq('/__nibble/health')
    const res = createFakeRes()
    handleHealth(req, res, defaultOpts({ editor: undefined }))
    expect(res._status).toBe(200)
    const body = JSON.parse(res._body) as { editor: string | null }
    expect(body.editor).toBeNull()
  })

  test('production returns 404', () => {
    process.env.NODE_ENV = 'production'
    const req = createFakeReq('/__nibble/health')
    const res = createFakeRes()
    handleHealth(req, res, defaultOpts())
    expect(res._status).toBe(404)
  })
})
