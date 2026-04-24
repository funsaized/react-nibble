import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  InspectorCandidate,
  InspectorConfig,
  OpenSourceClient,
  SourceLocation,
} from '@react-nibble/core'
import {
  HttpOpenSourceClient,
  buildCandidates,
  getInspectorDataForViewAtPoint,
} from '@react-nibble/core'
import { useColorScheme } from 'react-native'
import { InspectorProvider, useInspector } from './context.js'
import { OverlayLayer } from './OverlayLayer.js'
import { PickerDialog } from './PickerDialog.js'
import { TouchCaptureLayer } from './TouchCaptureLayer.js'
import type { InspectorTokenOverrides } from './tamagui/themeBridge.js'
import type { TamaguiConfig } from './tamagui/themeBridge.js'

declare const __DEV__: boolean | undefined
const IS_DEV = typeof __DEV__ === 'undefined' ? process.env['NODE_ENV'] !== 'production' : __DEV__

export interface InspectorRootProps {
  children: ReactNode
  tamaguiConfig: TamaguiConfig
  tokenOverrides?: InspectorTokenOverrides
  disabled?: boolean
  editorName?: string
  config?: Omit<InspectorConfig, 'tamaguiConfig' | 'tokenOverrides'>
}

function InspectorBody({
  tokenOverrides,
  editorName,
  client,
  onBeforeOpen,
  onAfterOpen,
  onOpenError,
}: {
  tokenOverrides?: InspectorTokenOverrides
  editorName?: string
  client: OpenSourceClient
  onBeforeOpen?: InspectorConfig['onBeforeOpen']
  onAfterOpen?: InspectorConfig['onAfterOpen']
  onOpenError?: InspectorConfig['onOpenError']
}) {
  const { isActive, setActive, lastCandidates, setCandidates } = useInspector()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [frame, setFrame] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [currentLabel, setCurrentLabel] = useState<string | undefined>(undefined)
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  const onTap = useCallback(
    (x: number, y: number) => {
      const rawFn = getInspectorDataForViewAtPoint()
      if (!rawFn) {
        setActive(false)
        return
      }
      // P1: buildCandidates called with null fiber — real fiber-at-point plumbing
      // deferred to Phase 2 T43 where example apps provide the root ref.
      // The candidate building logic is unit-tested at the core package level.
      const candidates: InspectorCandidate[] = buildCandidates(null)
      setCandidates(candidates)
      if (candidates.length > 0) {
        const c = candidates[0]!
        if (c.source) {
          setCurrentLabel(
            `${c.name} — ${c.source.file.split('/').pop() ?? ''}:${String(c.source.line)}`
          )
        }
        setFrame({ x, y, width: 0, height: 0 })
        setPickerOpen(true)
      }
      setActive(false)
    },
    [setActive, setCandidates]
  )

  const handleOpen = useCallback(
    async (c: InspectorCandidate) => {
      if (!c.source) return
      const loc: SourceLocation = c.source
      if (onBeforeOpen) {
        const proceed = await onBeforeOpen(loc)
        if (!proceed) return
      }
      try {
        await client.openSource(loc)
        onAfterOpen?.(loc)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        onOpenError?.({ message, location: loc })
      } finally {
        setPickerOpen(false)
        setFrame(null)
      }
    },
    [client, onBeforeOpen, onAfterOpen, onOpenError]
  )

  const handleCopy = useCallback((_c: InspectorCandidate) => {}, [])

  const handleClose = useCallback(() => {
    setPickerOpen(false)
    setFrame(null)
  }, [])

  return (
    <>
      <TouchCaptureLayer isActive={isActive} onTap={onTap} />
      <OverlayLayer frame={frame} label={currentLabel} isDark={isDark} tokens={tokenOverrides} />
      <PickerDialog
        visible={pickerOpen}
        candidates={lastCandidates}
        editorName={editorName}
        isDark={isDark}
        tokens={tokenOverrides}
        onOpen={handleOpen}
        onCopy={handleCopy}
        onClose={handleClose}
      />
    </>
  )
}

/**
 * Top-level wrapper. Renders children verbatim in release or when disabled.
 * In dev, mounts touch-capture / overlay / picker as absolutely-positioned siblings.
 *
 * The tamaguiConfig prop is REQUIRED to document the Tamagui-first contract,
 * but P1 passes it through as a no-op. Real config consumption happens
 * in Phase 2 when overlay/picker switch to Tamagui styled components.
 */
export function InspectorRoot({
  children,
  tamaguiConfig: _tamaguiConfig,
  tokenOverrides,
  disabled,
  editorName,
  config,
}: InspectorRootProps) {
  const client = useMemo(
    () => config?.openSourceClient ?? new HttpOpenSourceClient(),
    [config?.openSourceClient]
  )

  if (!IS_DEV || disabled) {
    return <>{children}</>
  }

  return (
    <InspectorProvider>
      {children}
      <InspectorBody
        tokenOverrides={tokenOverrides}
        editorName={editorName}
        client={client}
        onBeforeOpen={config?.onBeforeOpen}
        onAfterOpen={config?.onAfterOpen}
        onOpenError={config?.onOpenError}
      />
    </InspectorProvider>
  )
}
