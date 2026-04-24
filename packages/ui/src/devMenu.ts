type DevSettingsShape = {
  addMenuItem?: (title: string, handler: () => void) => void
}

let cachedDevSettings: DevSettingsShape | null | undefined
const registeredLabels = new Set<string>()
let devSettingsOverride: DevSettingsShape | null | undefined

function loadDevSettings(): DevSettingsShape | null {
  if (devSettingsOverride !== undefined) return devSettingsOverride
  if (cachedDevSettings !== undefined) return cachedDevSettings
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native') as { DevSettings?: DevSettingsShape }
    cachedDevSettings = mod.DevSettings ?? null
    return cachedDevSettings
  } catch {
    cachedDevSettings = null
    return null
  }
}

export function registerDevMenu(title: string, handler: () => void): void {
  if (registeredLabels.has(title)) return
  const ds = loadDevSettings()
  if (!ds?.addMenuItem) return
  ds.addMenuItem(title, handler)
  registeredLabels.add(title)
}

export function __resetDevMenuForTests(): void {
  cachedDevSettings = undefined
  devSettingsOverride = undefined
  registeredLabels.clear()
}

export function __setDevSettingsForTests(ds: DevSettingsShape | null): void {
  devSettingsOverride = ds
}
