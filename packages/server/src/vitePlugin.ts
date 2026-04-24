import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { handleHealth, handleOpenSource, type HandlerOptions } from './handler.js'

export interface NibbleVitePluginOptions {
  editor?: string
  allowedRoots?: string[]
  endpoint?: string
  onLaunch?: HandlerOptions['onLaunch']
}

function readPkgVersion(): string {
  try {
    const here =
      typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))
    const pkgPath = join(here, '..', 'package.json')
    const raw = readFileSync(pkgPath, 'utf8')
    const parsed = JSON.parse(raw) as { version?: string }
    return parsed.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

/**
 * Vite plugin that attaches react-nibble's dev-server endpoints.
 *
 * - GET `<endpoint>` (default `/__nibble/open-source`) — launches editor at file:line:column
 * - GET `/__nibble/health` — readiness probe
 *
 * Only active in `vite dev` (serve mode). No-op during build.
 */
export function nibbleVitePlugin(opts: NibbleVitePluginOptions = {}): Plugin {
  const endpoint = opts.endpoint ?? '/__nibble/open-source'
  const healthEndpoint = '/__nibble/health'
  const allowedRoots = opts.allowedRoots ?? [process.cwd()]
  const pkgVersion = readPkgVersion()
  const handlerOpts: HandlerOptions = {
    editor: opts.editor,
    allowedRoots,
    pkgVersion,
    onLaunch: opts.onLaunch,
  }

  return {
    name: 'react-nibble',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const method = req.method ?? 'GET'
        if (method !== 'GET') {
          next()
          return
        }
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (url.pathname === endpoint) {
          void handleOpenSource(req, res, handlerOpts)
          return
        }
        if (url.pathname === healthEndpoint) {
          handleHealth(req, res, handlerOpts)
          return
        }
        next()
      })
    },
  }
}
