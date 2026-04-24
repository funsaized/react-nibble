import type { InspectorCandidate, InspectorConfig } from '../types.js'
import { getComponentName } from './naming.js'
import { extractSourceLocation } from './sourceExtractor.js'

const DEFAULT_SKIP_COMPONENT_NAMES = new Set<string>([
  'Inspector',
  'Overlay',
  'InspectorDevMenu',
  'InspectorButton',
  'InspectorRoot',
  'TouchCaptureLayer',
  'OverlayLayer',
  'PickerDialog',
  'StatusBar',
  'RCTStatusBarManager',
  'SceneView',
  'Screen',
  'ScreenContainer',
  'ScreenStack',
  'NavigationContainer',
  'NavigationContent',
  'ExpoRoot',
  'RootLayout',
  'Slot',
  'RootErrorBoundary',
])

const DEFAULT_SKIP_SOURCE_PATTERNS: (string | RegExp)[] = [
  'node_modules/react-native/',
  'node_modules/@react-navigation/',
  'node_modules/react-native-screens/',
  'node_modules/one/',
  'node_modules/@tamagui/',
  /\/InspectorRoot\.tsx$/,
  /\/TouchCaptureLayer\.tsx$/,
  /\/OverlayLayer\.tsx$/,
  /\/PickerDialog\.tsx$/,
]

type Fiber = {
  _debugSource?: { fileName: string; lineNumber: number; columnNumber?: number }
  memoizedProps?: Record<string, unknown> | null
  type?: unknown
  elementType?: unknown
  _debugOwner?: Fiber
  return?: Fiber
  stateNode?: unknown
}

function matchesSkipPattern(file: string, patterns: (string | RegExp)[]): boolean {
  for (const p of patterns) {
    if (typeof p === 'string' ? file.includes(p) : p.test(file)) return true
  }
  return false
}

/**
 * Walk the fiber ancestor chain (via .return) looking for the nearest user
 * component with source in the user's codebase.
 *
 * P1 scope: emits only ONE candidate (rank-1 call-site).
 * P2 will extend via buildCandidatesFull().
 */
export function buildCandidates(
  touchedFiber: Fiber | null,
  config: Pick<
    InspectorConfig,
    'includeBabelInjectedCallerSource' | 'skipComponentNames' | 'skipSourcePatterns'
  > = {}
): InspectorCandidate[] {
  if (!touchedFiber) return []

  const skipNames = new Set(DEFAULT_SKIP_COMPONENT_NAMES)
  for (const n of config.skipComponentNames ?? []) skipNames.add(n)

  const skipPatterns = [...DEFAULT_SKIP_SOURCE_PATTERNS, ...(config.skipSourcePatterns ?? [])]

  const visited = new WeakSet<Fiber>()
  let current: Fiber | null = touchedFiber

  while (current && !visited.has(current)) {
    visited.add(current)

    const name = getComponentName(current)
    if (!skipNames.has(name)) {
      const source = extractSourceLocation(current, config)
      if (source && !matchesSkipPattern(source.file, skipPatterns)) {
        return [
          {
            name,
            kind: typeof current.type === 'string' ? 'host' : 'composite',
            source,
            confidence: 'high',
            fiber: current,
          },
        ]
      }
    }

    current = current.return ?? null
  }

  return []
}

export { DEFAULT_SKIP_COMPONENT_NAMES as __DEFAULT_SKIP_COMPONENT_NAMES }
export { DEFAULT_SKIP_SOURCE_PATTERNS as __DEFAULT_SKIP_SOURCE_PATTERNS }
