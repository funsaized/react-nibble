import type { SourceLocation } from '../types.js'

export function encodeOpenSource(loc: SourceLocation, editor?: string): string {
  const params = new URLSearchParams()
  params.set('file', loc.file)
  params.set('line', String(loc.line))
  params.set('column', String(loc.column ?? 1))
  if (editor) params.set('editor', editor)
  return params.toString()
}
