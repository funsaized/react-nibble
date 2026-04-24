import { defineConfig, type Options } from 'tsup'

export function createConfig(overrides: Partial<Options> = {}): ReturnType<typeof defineConfig> {
  return defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    platform: 'neutral',
    target: 'node22',
    ...overrides,
  })
}
