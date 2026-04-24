import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { isPathAllowed } from './pathGuard.js'

describe('isPathAllowed', () => {
  let tmpRoot: string
  let allowed: string
  let outside: string
  let insideFile: string
  let outsideFile: string

  beforeEach(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'pathguard-'))
    allowed = join(tmpRoot, 'allowed')
    outside = join(tmpRoot, 'outside')
    mkdirSync(allowed, { recursive: true })
    mkdirSync(outside, { recursive: true })
    insideFile = join(allowed, 'a.ts')
    outsideFile = join(outside, 'b.ts')
    writeFileSync(insideFile, '')
    writeFileSync(outsideFile, '')
  })

  afterEach(() => {
    rmSync(tmpRoot, { recursive: true, force: true })
  })

  test('file inside root is allowed', () => {
    expect(isPathAllowed(insideFile, [allowed])).toBe(true)
  })

  test('file outside root is denied', () => {
    expect(isPathAllowed(outsideFile, [allowed])).toBe(false)
  })

  test('path traversal via ../ is denied', () => {
    const traversal = join(allowed, '..', 'outside', 'b.ts')
    expect(isPathAllowed(traversal, [allowed])).toBe(false)
  })

  test('symlink pointing outside is denied', () => {
    const link = join(allowed, 'symlink.ts')
    symlinkSync(outsideFile, link)
    expect(isPathAllowed(link, [allowed])).toBe(false)
  })

  test('symlink pointing inside is allowed', () => {
    const inner = join(allowed, 'inner')
    mkdirSync(inner)
    const target = join(inner, 'c.ts')
    writeFileSync(target, '')
    const link = join(allowed, 'symlinked.ts')
    symlinkSync(target, link)
    expect(isPathAllowed(link, [allowed])).toBe(true)
  })

  test('empty allowedRoots denies everything', () => {
    expect(isPathAllowed(insideFile, [])).toBe(false)
  })

  test('nonexistent file is denied', () => {
    expect(isPathAllowed(join(allowed, 'nope.ts'), [allowed])).toBe(false)
  })
})
