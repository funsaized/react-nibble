import { describe, expect, test } from 'vitest'
import {
  extractSourceLocation,
  parseCallerSource,
  parseTestIdForSource,
} from './sourceExtractor.js'

describe('parseTestIdForSource', () => {
  test('parses valid testID format', () => {
    const result = parseTestIdForSource('Button@src/components/Button.tsx:42:12')
    expect(result).toEqual({
      componentName: 'Button',
      relativePath: 'src/components/Button.tsx',
      lineNumber: 42,
      columnNumber: 12,
    })
  })

  test('returns null for malformed testID', () => {
    expect(parseTestIdForSource('just-a-test-id')).toBeNull()
    expect(parseTestIdForSource('')).toBeNull()
    expect(parseTestIdForSource('NoAt@')).toBeNull()
  })
})

describe('parseCallerSource', () => {
  test('parses valid callerSource object', () => {
    const result = parseCallerSource(
      { fileName: '/abs/path/Button.tsx', lineNumber: 10, columnNumber: 5 },
      'Button'
    )
    expect(result).toEqual({
      componentName: 'Button',
      relativePath: '/abs/path/Button.tsx',
      absolutePath: '/abs/path/Button.tsx',
      lineNumber: 10,
      columnNumber: 5,
    })
  })

  test('returns null for non-object input', () => {
    expect(parseCallerSource(null)).toBeNull()
    expect(parseCallerSource(undefined)).toBeNull()
    expect(parseCallerSource('string')).toBeNull()
  })

  test('returns null when fileName is missing', () => {
    expect(parseCallerSource({ lineNumber: 1 })).toBeNull()
  })

  test('defaults lineNumber to 1 and columnNumber to 1 when absent', () => {
    const result = parseCallerSource({ fileName: '/src/Widget.tsx' })
    expect(result).toEqual({
      componentName: undefined,
      relativePath: '/src/Widget.tsx',
      absolutePath: '/src/Widget.tsx',
      lineNumber: 1,
      columnNumber: 1,
    })
  })
})

describe('extractSourceLocation', () => {
  test('returns _debugSource when present', () => {
    const fiber = {
      _debugSource: { fileName: '/src/App.tsx', lineNumber: 25, columnNumber: 8 },
    }
    expect(extractSourceLocation(fiber)).toEqual({
      file: '/src/App.tsx',
      line: 25,
      column: 8,
    })
  })

  test('falls back to testID when _debugSource is absent', () => {
    const fiber = {
      memoizedProps: { testID: 'FeedScreen@src/screens/Feed.tsx:10:1' },
    }
    expect(extractSourceLocation(fiber)).toEqual({
      file: 'src/screens/Feed.tsx',
      line: 10,
      column: 1,
    })
  })

  test('returns null for malformed testID without _debugSource', () => {
    const fiber = {
      memoizedProps: { testID: 'bad-format' },
    }
    expect(extractSourceLocation(fiber)).toBeNull()
  })

  test('returns __callerSource when flag is ON', () => {
    const fiber = {
      memoizedProps: {
        __callerSource: { fileName: '/abs/Card.tsx', lineNumber: 5, columnNumber: 3 },
      },
    }
    expect(extractSourceLocation(fiber, { includeBabelInjectedCallerSource: true })).toEqual({
      file: '/abs/Card.tsx',
      line: 5,
      column: 3,
    })
  })

  test('ignores __callerSource when flag is OFF', () => {
    const fiber = {
      memoizedProps: {
        __callerSource: { fileName: '/abs/Card.tsx', lineNumber: 5, columnNumber: 3 },
      },
    }
    expect(extractSourceLocation(fiber)).toBeNull()
  })

  test('returns null for all-null fiber', () => {
    const fiber = {}
    expect(extractSourceLocation(fiber)).toBeNull()
  })

  test('returns column as undefined when _debugSource has no columnNumber', () => {
    const fiber = {
      _debugSource: { fileName: '/src/App.tsx', lineNumber: 10 },
    }
    const result = extractSourceLocation(fiber)
    expect(result).toEqual({ file: '/src/App.tsx', line: 10, column: undefined })
  })

  test('handles _debugSource with columnNumber: 0', () => {
    const fiber = {
      _debugSource: { fileName: '/src/App.tsx', lineNumber: 1, columnNumber: 0 },
    }
    const result = extractSourceLocation(fiber)
    expect(result).toEqual({ file: '/src/App.tsx', line: 1, column: 0 })
  })

  test('returns null when props is not an object', () => {
    const fiber = { memoizedProps: null }
    expect(extractSourceLocation(fiber)).toBeNull()
  })

  test('ignores __callerSource with missing fileName', () => {
    const fiber = {
      memoizedProps: {
        __callerSource: { lineNumber: 5 },
      },
    }
    expect(extractSourceLocation(fiber, { includeBabelInjectedCallerSource: true })).toBeNull()
  })
})
