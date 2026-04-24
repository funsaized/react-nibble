import { describe, expect, test } from 'vitest'
import { buildCandidates } from './fiberWalker.js'

type TestFiber = {
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number }
  memoizedProps?: Record<string, unknown> | null
  type?: unknown
  elementType?: unknown
  return?: TestFiber
}

function makeFiber(overrides: Partial<TestFiber> & { type?: unknown } = {}): TestFiber {
  return { ...overrides }
}

describe('buildCandidates', () => {
  test('walks up to find nearest user component with source', () => {
    const buttonFiber = makeFiber({
      type: function Button() {},
      _debugSource: { fileName: 'src/Button.tsx', lineNumber: 10, columnNumber: 5 },
    })
    const tamaguiFiber = makeFiber({
      type: function XStack() {},
      _debugSource: {
        fileName: 'node_modules/@tamagui/stacks/src/XStack.tsx',
        lineNumber: 1,
      },
      return: buttonFiber,
    })
    const hostFiber = makeFiber({
      type: 'View',
      _debugSource: {
        fileName: 'node_modules/react-native/Libraries/Components/View/View.js',
        lineNumber: 1,
      },
      return: tamaguiFiber,
    })

    const result = buildCandidates(hostFiber)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Button')
    expect(result[0]!.kind).toBe('composite')
    expect(result[0]!.source).toEqual({
      file: 'src/Button.tsx',
      line: 10,
      column: 5,
    })
    expect(result[0]!.confidence).toBe('high')
  })

  test('returns empty array when all ancestors are skip-listed', () => {
    const inspectorFiber = makeFiber({
      type: function Inspector() {},
      _debugSource: { fileName: 'src/Inspector.tsx', lineNumber: 1 },
    })
    const overlayFiber = makeFiber({
      type: function Overlay() {},
      _debugSource: { fileName: 'src/Overlay.tsx', lineNumber: 1 },
      return: inspectorFiber,
    })

    const result = buildCandidates(overlayFiber)
    expect(result).toEqual([])
  })

  test('does not hang on cyclic fiber chain', () => {
    const fiberA = makeFiber({
      type: function A() {},
    })
    const fiberB = makeFiber({
      type: function B() {},
      return: fiberA,
    })
    fiberA.return = fiberB

    const result = buildCandidates(fiberB)
    expect(result).toEqual([])
  })

  test('respects user-extensible skip list', () => {
    const customFiber = makeFiber({
      type: function MyCustomComponent() {},
      _debugSource: { fileName: 'src/Custom.tsx', lineNumber: 1 },
    })
    const parentFiber = makeFiber({
      type: function App() {},
      _debugSource: { fileName: 'src/App.tsx', lineNumber: 1 },
      return: undefined,
    })
    customFiber.return = parentFiber

    const withSkip = buildCandidates(customFiber, {
      skipComponentNames: ['MyCustomComponent'],
    })
    expect(withSkip).toHaveLength(1)
    expect(withSkip[0]!.name).toBe('App')

    const withoutSkip = buildCandidates(customFiber)
    expect(withoutSkip).toHaveLength(1)
    expect(withoutSkip[0]!.name).toBe('MyCustomComponent')
  })

  test('returns host fiber with kind host when it has user source', () => {
    const hostFiber = makeFiber({
      type: 'View',
      _debugSource: { fileName: 'src/layouts/MainLayout.tsx', lineNumber: 15 },
    })

    const result = buildCandidates(hostFiber)
    expect(result).toHaveLength(1)
    expect(result[0]!.kind).toBe('host')
    expect(result[0]!.name).toBe('View')
  })

  test('returns empty for null fiber', () => {
    expect(buildCandidates(null)).toEqual([])
  })

  test('skips custom source patterns', () => {
    const fiber = makeFiber({
      type: function Widget() {},
      _debugSource: { fileName: '/app/node_modules/my-lib/Widget.tsx', lineNumber: 1 },
    })
    const parentFiber = makeFiber({
      type: function App() {},
      _debugSource: { fileName: 'src/App.tsx', lineNumber: 1 },
    })
    fiber.return = parentFiber

    const result = buildCandidates(fiber, {
      skipSourcePatterns: ['my-lib/'],
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('App')
  })
})
