import type { CodeInfo, SourceLocation } from '../types.js'

type Fiber = {
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number }
  memoizedProps?: Record<string, unknown> | null
  type?: unknown
  elementType?: unknown
  _debugOwner?: Fiber
  return?: Fiber
  stateNode?: unknown
}

const TEST_ID_SOURCE_RE = /^([^@]+)@(.+):(\d+):(\d+)$/

export function parseTestIdForSource(testId: string): CodeInfo | null {
  const match = TEST_ID_SOURCE_RE.exec(testId)
  if (!match) return null
  const [, componentName, relativePath, lineStr, columnStr] = match
  if (!componentName || !relativePath || !lineStr || !columnStr) return null
  return {
    componentName,
    relativePath,
    lineNumber: Number.parseInt(lineStr, 10),
    columnNumber: Number.parseInt(columnStr, 10),
  }
}

export function parseCallerSource(callerSource: unknown, componentName?: string): CodeInfo | null {
  if (!callerSource || typeof callerSource !== 'object') return null
  const obj = callerSource as { fileName?: string; lineNumber?: number; columnNumber?: number }
  if (!obj.fileName) return null
  return {
    componentName,
    relativePath: obj.fileName,
    absolutePath: obj.fileName,
    lineNumber: obj.lineNumber ?? 1,
    columnNumber: obj.columnNumber ?? 1,
  }
}

/**
 * Extract a SourceLocation from a single fiber using priority:
 *   1. fiber._debugSource
 *   2. fiber.memoizedProps.testID with "Name@path:line:col" format
 *   3. fiber.memoizedProps.__callerSource (only when opts.includeBabelInjectedCallerSource)
 */
export function extractSourceLocation(
  fiber: Fiber,
  opts: { includeBabelInjectedCallerSource?: boolean } = {}
): SourceLocation | null {
  if (fiber._debugSource?.fileName) {
    return {
      file: fiber._debugSource.fileName,
      line: fiber._debugSource.lineNumber,
      column: fiber._debugSource.columnNumber,
    }
  }

  const props = fiber.memoizedProps
  if (!props || typeof props !== 'object') return null

  const testID = (props as { testID?: unknown }).testID
  if (typeof testID === 'string') {
    const parsed = parseTestIdForSource(testID)
    if (parsed?.relativePath) {
      return {
        file: parsed.relativePath,
        line: parsed.lineNumber,
        column: parsed.columnNumber,
      }
    }
  }

  if (opts.includeBabelInjectedCallerSource) {
    const caller = (props as { __callerSource?: unknown }).__callerSource
    const parsed = parseCallerSource(caller)
    if (parsed?.relativePath) {
      return {
        file: parsed.relativePath,
        line: parsed.lineNumber,
        column: parsed.columnNumber,
      }
    }
  }

  return null
}
