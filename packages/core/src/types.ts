/**
 * Absolute source location on the developer's machine.
 */
export type SourceLocation = {
  /** absolute path on developer's machine */
  file: string
  /** 1-based line number */
  line: number
  /** 1-based column number, optional */
  column?: number
}

/**
 * Ranked candidate surfaced by the picker UI. One touch can produce many.
 */
export type InspectorCandidate = {
  /** display name (e.g. `Button`, `FeedScreen`) */
  name: string
  /** whether this is a host fiber, composite component, or HOC owner */
  kind: 'host' | 'composite' | 'owner'
  /** extracted source location, if any */
  source?: SourceLocation
  /** confidence in the candidate ranking */
  confidence: 'high' | 'medium' | 'low'
  /** opaque fiber reference for hover/highlight lookups */
  fiber?: unknown
}

/**
 * Pluggable transport that opens a source location in an editor.
 * Default implementation: HttpOpenSourceClient -> GET /__nibble/open-source.
 */
export interface OpenSourceClient {
  openSource(location: SourceLocation): Promise<void>
  /** Optional health probe for toast-surfacing unreachable dev servers */
  ping?(): Promise<boolean>
}

/**
 * Opt-in anonymous telemetry (see design section 14).
 * Off by default. No PII ever collected.
 */
export interface TelemetryOptions {
  enabled?: boolean
  endpoint?: string
}

/**
 * Inspector runtime config, consumed by initializeInspector() and InspectorRoot.
 */
export interface InspectorConfig {
  /** default: __DEV__ */
  enabled?: boolean
  /** default: new HttpOpenSourceClient() */
  openSourceClient?: OpenSourceClient
  /** override auto-detected dev server URL */
  devServerUrl?: string
  /** how the inspector activates */
  activationGesture?: 'devMenu' | 'longPress' | 'both'
  /** P3 opt-in: read __callerSource prop injected by our babel plugin */
  includeBabelInjectedCallerSource?: boolean
  /** extend the SKIP_COMPONENT_NAMES list */
  skipComponentNames?: string[]
  /** extend the SKIP_SOURCE_PATTERNS list */
  skipSourcePatterns?: (string | RegExp)[]
  /** debug hook: fires every time candidates are built */
  onCandidatesBuilt?(candidates: InspectorCandidate[]): void
  /** preflight — return false to cancel the open */
  onBeforeOpen?(location: SourceLocation): boolean | Promise<boolean>
  /** fires after a successful open */
  onAfterOpen?(location: SourceLocation): void
  /** fires when the open fails */
  onOpenError?(err: { message: string; location: SourceLocation }): void
  /** opt-in anonymous telemetry (off by default) */
  telemetry?: TelemetryOptions
}

/**
 * Code info extracted from a fiber, prior to ranking.
 * Internal shape — not part of the public API.
 */
export interface CodeInfo {
  componentName?: string
  relativePath?: string
  absolutePath?: string
  lineNumber: number
  columnNumber: number
}
