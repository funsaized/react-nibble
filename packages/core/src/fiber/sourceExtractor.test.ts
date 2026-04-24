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
})
