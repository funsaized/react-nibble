import { initializeInspector } from 'react-nibble'

declare const __DEV__: boolean | undefined

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  initializeInspector()
}
