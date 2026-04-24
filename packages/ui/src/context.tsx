import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { InspectorCandidate } from '@react-nibble/core'

export interface InspectorContextValue {
  isActive: boolean
  toggle: () => void
  setActive: (active: boolean) => void
  lastCandidates: InspectorCandidate[]
  setCandidates: (c: InspectorCandidate[]) => void
  addToDevMenu: (label: string, handler: () => void) => () => void
}

const InspectorCtx = createContext<InspectorContextValue | null>(null)

type Listener = () => void
const listeners: Set<Listener> = new Set()

export function subscribeGlobalToggle(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function toggleInspectorGlobal(): void {
  for (const l of listeners) l()
}

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [isActive, setActive] = useState(false)
  const [lastCandidates, setCandidates] = useState<InspectorCandidate[]>([])
  const devMenuEntriesRef = useRef<Map<string, () => void>>(new Map())

  const toggle = useCallback(() => setActive((v) => !v), [])

  useEffect(() => {
    const unsub = subscribeGlobalToggle(() => setActive((v) => !v))
    return unsub
  }, [])

  const addToDevMenu = useCallback((label: string, handler: () => void) => {
    devMenuEntriesRef.current.set(label, handler)
    return () => {
      devMenuEntriesRef.current.delete(label)
    }
  }, [])

  const value: InspectorContextValue = useMemo(
    () => ({ isActive, toggle, setActive, lastCandidates, setCandidates, addToDevMenu }),
    [isActive, toggle, lastCandidates, addToDevMenu]
  )

  return <InspectorCtx.Provider value={value}>{children}</InspectorCtx.Provider>
}

export function useInspector(): InspectorContextValue {
  const ctx = useContext(InspectorCtx)
  if (!ctx) throw new Error('useInspector() must be called inside <InspectorProvider>')
  return ctx
}
