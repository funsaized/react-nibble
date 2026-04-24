import { describe, expect, test } from 'vitest'
import { getComponentName } from './naming.js'

describe('getComponentName', () => {
  test('returns Fragment for symbol type', () => {
    expect(getComponentName({ type: Symbol.for('react.fragment') })).toBe('Fragment')
  })

  test('returns string type directly (host component)', () => {
    expect(getComponentName({ type: 'View' })).toBe('View')
    expect(getComponentName({ type: 'Text' })).toBe('Text')
  })

  test('returns displayName from function type', () => {
    const MyComponent = () => null
    MyComponent.displayName = 'MyComponent'
    expect(getComponentName({ type: MyComponent })).toBe('MyComponent')
  })

  test('returns name from function type when displayName is absent', () => {
    function Button() {
      return null
    }
    expect(getComponentName({ type: Button })).toBe('Button')
  })

  test('returns displayName from object type (forwardRef/memo)', () => {
    expect(getComponentName({ type: { displayName: 'WrappedCard' } })).toBe('WrappedCard')
  })

  test('falls back to elementType displayName', () => {
    expect(getComponentName({ elementType: { displayName: 'LazyHome' } })).toBe('LazyHome')
  })

  test('falls back to elementType name', () => {
    expect(getComponentName({ elementType: { name: 'Fallback' } })).toBe('Fallback')
  })

  test('returns Unknown for null fiber', () => {
    expect(getComponentName(null)).toBe('Unknown')
    expect(getComponentName(undefined)).toBe('Unknown')
  })

  test('returns Unknown for empty fiber', () => {
    expect(getComponentName({})).toBe('Unknown')
  })
})
