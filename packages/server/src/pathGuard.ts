import { realpathSync } from 'node:fs'
import { resolve, sep } from 'node:path'

/**
 * Check whether a file path is inside one of the allowed workspace roots.
 * Resolves symlinks to prevent escape via symlink.
 */
export function isPathAllowed(file: string, allowedRoots: string[]): boolean {
  if (!file || !allowedRoots.length) return false

  let resolvedFile: string
  try {
    resolvedFile = realpathSync(resolve(file))
  } catch {
    // file doesn't exist or can't be resolved — treat as not allowed
    return false
  }

  for (const root of allowedRoots) {
    let resolvedRoot: string
    try {
      resolvedRoot = realpathSync(resolve(root))
    } catch {
      continue
    }
    const normalizedRoot = resolvedRoot.endsWith(sep) ? resolvedRoot : resolvedRoot + sep
    if (resolvedFile === resolvedRoot || resolvedFile.startsWith(normalizedRoot)) {
      return true
    }
  }

  return false
}
