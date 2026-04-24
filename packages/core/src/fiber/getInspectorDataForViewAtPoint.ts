export type InspectorHierarchyEntry = {
  name?: string
  getInspectorData?: () => {
    measure?: (
      cb: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void
    ) => void
    props?: Record<string, unknown>
    source?: { fileName: string; lineNumber: number; columnNumber?: number }
    [key: string]: unknown
  }
  [key: string]: unknown
}

export type TouchedViewDataAtPoint = {
  hierarchy: InspectorHierarchyEntry[]
  props: Record<string, unknown>
  frame?: { left: number; top: number; width: number; height: number }
  touchedViewTag?: number
  componentStack?: string
  selection?: unknown
  [key: string]: unknown
}

export type GetInspectorDataForViewAtPointFn = (
  inspectedView: unknown,
  locationX: number,
  locationY: number,
  callback: (viewData: TouchedViewDataAtPoint) => boolean
) => void

type ModuleShape = { default?: GetInspectorDataForViewAtPointFn } & Record<string, unknown>

// RN 0.82+ path
const NEW_ARCH_PATH =
  'react-native/src/private/devsupport/devmenu/elementinspector/getInspectorDataForViewAtPoint'
// RN 0.73-0.81 path
const OLD_ARCH_PATH = 'react-native/Libraries/Inspector/getInspectorDataForViewAtPoint'

let cached: GetInspectorDataForViewAtPointFn | null | undefined
let resolverOverride: ((path: string) => GetInspectorDataForViewAtPointFn | null) | null = null

function tryRequire(path: string): GetInspectorDataForViewAtPointFn | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(path) as ModuleShape | GetInspectorDataForViewAtPointFn
    if (typeof mod === 'function') return mod
    if (mod && typeof mod.default === 'function') return mod.default
  } catch {
    // module not available at runtime
  }
  return null
}

function resolve(path: string): GetInspectorDataForViewAtPointFn | null {
  return resolverOverride ? resolverOverride(path) : tryRequire(path)
}

function loadFn(): GetInspectorDataForViewAtPointFn | null {
  if (cached !== undefined) return cached

  const newArch = resolve(NEW_ARCH_PATH)
  if (newArch) {
    cached = newArch
    return newArch
  }

  const oldArch = resolve(OLD_ARCH_PATH)
  if (oldArch) {
    cached = oldArch
    return oldArch
  }

  cached = null
  return null
}

export function getInspectorDataForViewAtPoint(): GetInspectorDataForViewAtPointFn | null {
  return loadFn()
}

export function __resetCacheForTests(): void {
  cached = undefined
}

export function __setResolverForTests(
  resolver: ((path: string) => GetInspectorDataForViewAtPointFn | null) | null
): void {
  resolverOverride = resolver
}
