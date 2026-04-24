import { memo } from 'react'
import type { ViewStyle } from 'react-native'
import { View as RNView, Text as RNText, Platform } from 'react-native'
import type { InspectorTokenOverrides } from './tamagui/themeBridge.js'
import { resolveInspectorTokens } from './tamagui/themeBridge.js'

export interface OverlayFrame {
  x: number
  y: number
  width: number
  height: number
}

export interface OverlayLayerProps {
  frame: OverlayFrame | null
  label?: string
  isDark?: boolean
  tokens?: InspectorTokenOverrides
  testID?: string
}

export const OverlayLayer = memo(function OverlayLayer({
  frame,
  label,
  isDark = false,
  tokens,
  testID,
}: OverlayLayerProps) {
  if (!frame) return null

  const t = resolveInspectorTokens(tokens, isDark)

  const highlightStyle: ViewStyle = {
    position: 'absolute',
    top: frame.y,
    left: frame.x,
    width: frame.width,
    height: frame.height,
    backgroundColor: t.overlayColor,
    borderColor: t.overlayBorderColor,
    borderWidth: 2,
    borderRadius: 2,
    zIndex: 2147483645,
  }

  const tagStyle: ViewStyle = {
    position: 'absolute',
    top: Math.max(0, frame.y - 28),
    left: frame.x,
    maxWidth: Math.min(320, frame.width + 200),
    backgroundColor: t.tagBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2147483646,
  }

  return (
    <RNView pointerEvents="none" testID={testID ?? 'nibble-overlay-root'}>
      <RNView style={highlightStyle} testID="nibble-overlay-highlight" />
      {label ? (
        <RNView style={tagStyle} testID="nibble-overlay-tag">
          <RNText
            style={{
              color: t.tagForeground,
              fontSize: 12,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            }}
            numberOfLines={1}
          >
            {label}
          </RNText>
        </RNView>
      ) : null}
    </RNView>
  )
})
