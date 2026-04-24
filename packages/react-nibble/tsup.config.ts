import { defineConfig } from 'tsup'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const pkg = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')) as {
  name: string
  peerDependencies?: Record<string, string>
  dependencies?: Record<string, string>
}

// External: ONLY direct dependencies + peer dependencies. Workspace deps (@react-nibble/*)
// are INLINED — this is the whole point of the facade.
const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
  // node builtins we actually use
  'node:fs',
  'node:path',
  'node:url',
  'node:http',
  'node:module',
]

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts',
  },
  format: ['esm', 'cjs'],
  dts: { resolve: [/^@react-nibble\//], compilerOptions: { ignoreDeprecations: '6.0' } },
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  platform: 'neutral',
  target: 'node22',
  external,
  // Inline @react-nibble/* explicitly:
  noExternal: [/^@react-nibble\//],
})
