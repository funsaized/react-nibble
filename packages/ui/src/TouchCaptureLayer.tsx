import { forwardRef, useCallback } from 'react'
import type { View, ViewStyle, GestureResponderEvent } from 'react-native'
import { View as RNView } from 'react-native'

export interface TouchCaptureLayerProps {
  isActive: boolean
  onTap: (x: number, y: number) => void
  style?: ViewStyle
  testID?: string
}

const BASE_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 2147483640,
}

export const TouchCaptureLayer = forwardRef<View, TouchCaptureLayerProps>(function TouchCaptureLayer(
  { isActive, onTap, style, testID },
  ref
) {
  const handleRelease = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent
      onTap(pageX, pageY)
    },
    [onTap]
  )

  return (
    <RNView
      ref={ref}
      testID={testID ?? 'nibble-touch-capture'}
      style={[BASE_STYLE, style]}
      pointerEvents={isActive ? 'auto' : 'none'}
      onStartShouldSetResponder={() => isActive}
      onResponderGrant={() => {}}
      onResponderRelease={handleRelease}
    />
  )
})
