/**
 * Payload schema per design section 14.1. NEVER includes file paths,
 * component names, source code, or IP addresses.
 */
export interface TelemetryEvent {
  event: 'inspector-opened' | 'component-tapped' | 'editor-launched' | 'editor-launch-failed'
  ts: string
  pkgVersion: string
  node?: string
  os?: string
  editor?: string
  sessionId: string
}
