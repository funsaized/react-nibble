import type { InspectorConfig } from '@react-nibble/core'
import { getTelemetry } from '@react-nibble/core'
import { toggleInspectorGlobal } from './context.js'
import { registerDevMenu } from './devMenu.js'

declare const __DEV__: boolean | undefined
const IS_DEV = typeof __DEV__ === 'undefined' ? process.env['NODE_ENV'] !== 'production' : __DEV__

export function initializeInspector(config: InspectorConfig = {}): void {
  if (!IS_DEV) return
  if (config.telemetry) {
    getTelemetry(config.telemetry)
  }
  registerDevMenu('Toggle react-nibble Inspector', toggleInspectorGlobal)
}
