import type { IncomingMessage, ServerResponse } from 'node:http'
import { createRequire } from 'node:module'
import { isPathAllowed } from './pathGuard.js'

export interface HandlerOptions {
  editor?: string
  allowedRoots: string[]
  pkgVersion: string
  /** Escape hatch: replace launch-editor for an editor it doesn't know. */
  onLaunch?: (req: {
    file: string
    line: number
    column: number
    editor: string | undefined
  }) => Promise<void>
}

type LaunchEditorFn = (
  fileWithPosition: string,
  editor: string | undefined,
  onErrorCallback: (filename: string, errorMsg: string) => void
) => void

let cachedLaunchEditor: LaunchEditorFn | null | undefined

function loadLaunchEditor(): LaunchEditorFn | null {
  if (cachedLaunchEditor !== undefined) return cachedLaunchEditor
  try {
    const esmRequire = createRequire(import.meta.url)
    const mod = esmRequire('launch-editor') as LaunchEditorFn | { default: LaunchEditorFn }
    cachedLaunchEditor = typeof mod === 'function' ? mod : mod.default
    return cachedLaunchEditor
  } catch {
    cachedLaunchEditor = null
    return null
  }
}

function resolveEditor(queryEditor: string | undefined, opts: HandlerOptions): string | undefined {
  return queryEditor ?? opts.editor ?? process.env.LAUNCH_EDITOR ?? process.env.EDITOR
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}

/**
 * Handle GET /__nibble/open-source?file=&line=&column=&editor=
 *
 * Returns 404 in production, 403 for path-guard failures, 200 on success.
 */
export async function handleOpenSource(
  req: IncomingMessage,
  res: ServerResponse,
  opts: HandlerOptions
): Promise<void> {
  if (!isDev()) {
    sendJson(res, 404, { ok: false, error: 'not found' })
    return
  }

  const url = new URL(req.url ?? '/', 'http://localhost')
  const file = url.searchParams.get('file') ?? ''
  const lineStr = url.searchParams.get('line') ?? ''
  const columnStr = url.searchParams.get('column') ?? ''
  const queryEditor = url.searchParams.get('editor') ?? undefined

  if (!file || !lineStr) {
    sendJson(res, 400, { ok: false, error: 'missing file or line param' })
    return
  }

  const line = Number.parseInt(lineStr, 10)
  const column = Number.parseInt(columnStr || '1', 10)
  if (!Number.isFinite(line) || line < 1 || !Number.isFinite(column) || column < 1) {
    sendJson(res, 400, { ok: false, error: 'invalid line or column' })
    return
  }

  if (!isPathAllowed(file, opts.allowedRoots)) {
    sendJson(res, 403, { ok: false, error: 'file outside allowed roots' })
    return
  }

  const editor = resolveEditor(queryEditor, opts)
  if (!editor) {
    sendJson(res, 500, {
      ok: false,
      error: 'no editor configured (set LAUNCH_EDITOR env var)',
    })
    return
  }

  if (opts.onLaunch) {
    try {
      await opts.onLaunch({ file, line, column, editor })
      sendJson(res, 200, { ok: true })
      return
    } catch (err) {
      sendJson(res, 500, {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      })
      return
    }
  }

  const launchEditor = loadLaunchEditor()
  if (!launchEditor) {
    sendJson(res, 500, { ok: false, error: 'launch-editor not installed' })
    return
  }

  await new Promise<void>((resolveP) => {
    let settled = false
    launchEditor(`${file}:${line}:${column}`, editor, (_filename, errorMsg) => {
      if (settled) return
      settled = true
      sendJson(res, 500, { ok: false, error: errorMsg })
      resolveP()
    })
    // launch-editor is fire-and-forget: if no error within 500ms, treat as success
    setTimeout(() => {
      if (settled) return
      settled = true
      sendJson(res, 200, { ok: true })
      resolveP()
    }, 500)
  })
}

/**
 * Handle GET /__nibble/health
 *
 * Returns 200 with version/editor in dev, 404 in prod.
 */
export function handleHealth(
  _req: IncomingMessage,
  res: ServerResponse,
  opts: HandlerOptions
): void {
  if (!isDev()) {
    sendJson(res, 404, { ok: false, error: 'not found' })
    return
  }
  const editor = resolveEditor(undefined, opts)
  sendJson(res, 200, {
    ok: true,
    version: opts.pkgVersion,
    editor: editor ?? null,
  })
}

/** Test hook to reset the cached launch-editor module. */
export function __resetLaunchEditorCacheForTests(): void {
  cachedLaunchEditor = undefined
}
