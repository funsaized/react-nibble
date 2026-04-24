type NativeModulesShape = {
  SourceCode?: {
    scriptURL?: string
  }
}

type PlatformOS = 'ios' | 'android' | 'web' | 'node'

let platformOverride: PlatformOS | null = null
let nativeModulesOverride: NativeModulesShape | null | undefined

function getPlatformOS(): PlatformOS {
  if (platformOverride) return platformOverride

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require('react-native') as {
      Platform: { OS: 'ios' | 'android' | 'web' }
    }
    return Platform.OS
  } catch {
    return 'node'
  }
}

function getNativeModules(): NativeModulesShape | null {
  if (nativeModulesOverride !== undefined) return nativeModulesOverride

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { NativeModules } = require('react-native') as { NativeModules: NativeModulesShape }
    return NativeModules ?? null
  } catch {
    return null
  }
}

export function resolveDevServerBase(override?: string): string {
  if (override) return override.replace(/\/+$/, '')

  const mods = getNativeModules()
  const script = mods?.SourceCode?.scriptURL
  if (script) {
    try {
      const u = new URL(script)
      return `${u.protocol}//${u.host}`
    } catch {
      // malformed scriptURL, fall through to platform default
    }
  }

  const os = getPlatformOS()
  if (os === 'android') return 'http://10.0.2.2:8081'
  return 'http://localhost:8081'
}

export function __setTestOverrides(
  platform: PlatformOS | null,
  nativeModules?: NativeModulesShape | null
): void {
  platformOverride = platform
  nativeModulesOverride = nativeModules === undefined ? undefined : nativeModules
}

export function __resetTestOverrides(): void {
  platformOverride = null
  nativeModulesOverride = undefined
}
