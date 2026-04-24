type FiberLike = {
  type?: unknown
  elementType?: unknown
}

export function getComponentName(fiber: FiberLike | null | undefined): string {
  if (!fiber) return 'Unknown'

  const { type, elementType } = fiber

  if (typeof type === 'symbol') return 'Fragment'
  if (typeof type === 'string') return type

  if (type && typeof type === 'object') {
    const t = type as { displayName?: string; name?: string }
    if (typeof t.displayName === 'string' && t.displayName) return t.displayName
    if (typeof t.name === 'string' && t.name) return t.name
  }

  if (typeof type === 'function') {
    const t = type as { displayName?: string; name?: string }
    if (typeof t.displayName === 'string' && t.displayName) return t.displayName
    if (typeof t.name === 'string' && t.name) return t.name
  }

  if (elementType && typeof elementType === 'object') {
    const e = elementType as { displayName?: string; name?: string }
    if (typeof e.displayName === 'string' && e.displayName) return e.displayName
    if (typeof e.name === 'string' && e.name) return e.name
  }

  return 'Unknown'
}
