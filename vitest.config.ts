import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    passWithNoTests: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/dist/**',
        'packages/ui/src/InspectorRoot.tsx',
        'packages/ui/src/OverlayLayer.tsx',
        'packages/ui/src/PickerDialog.tsx',
        'packages/ui/src/TouchCaptureLayer.tsx',
      ],
    },
  },
})
