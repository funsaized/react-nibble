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

  test('returns name from object type when displayName is absent', () => {
    expect(getComponentName({ type: { name: 'ForwardedInput' } })).toBe('ForwardedInput')
  })

  test('prefers displayName over name on object type', () => {
    expect(getComponentName({ type: { displayName: 'DisplayName', name: 'InternalName' } })).toBe(
      'DisplayName'
    )
  })

  test('returns Unknown for type that is number', () => {
    expect(getComponentName({ type: 42 })).toBe('Unknown')
  })

  test('skips object type with empty displayName and empty name', () => {
    expect(getComponentName({ type: { displayName: '', name: '' } })).toBe('Unknown')
  })

  test('returns elementType name when type is not useful', () => {
    expect(getComponentName({ type: 42, elementType: { name: 'LazyLoaded' } })).toBe('LazyLoaded')
  })
})
