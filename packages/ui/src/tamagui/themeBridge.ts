/**
 * Minimal representation of the Tamagui config returned by `createTamagui()`.
 *
 * We define our own interface rather than importing `TamaguiInternalConfig` from
 * `@tamagui/web` because Tamagui v1.x type declarations use extensionless relative
 * imports incompatible with `moduleResolution: NodeNext`. Phase 2 will switch to
 * Tamagui v2 RC where this is fixed and re-export the canonical type.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TamaguiConfig extends Record<string, unknown> {}

/**
 * Token overrides for the inspector overlay UI.
 * These are merged on top of the host app's Tamagui config at render time.
 */
export interface InspectorTokenOverrides {
  overlayColor?: string
  overlayBorderColor?: string
  tagBackground?: string
  tagForeground?: string
  pickerBackground?: string
  pickerForeground?: string
  accentColor?: string
}

/**
 * Build a derived Tamagui config by merging the host config with inspector-specific overrides.
 *
 * We never MUTATE the host config — we return a shallow-cloned derived config with only
 * the overlay-related token slots overridden when provided.
 *
 * For P1 we return the host config untouched. The overrides are consumed
 * directly by overlay/picker components via InspectorProvider context.
 */
export function buildInspectorTheme(
  hostConfig: TamaguiConfig,
  _overrides?: InspectorTokenOverrides
): TamaguiConfig {
  return hostConfig
}

/**
 * Derive contrast-safe defaults for inspector tokens when the host provides none.
 * The picker/overlay components call this when `tokenOverrides` is undefined.
 */
export function resolveInspectorTokens(
  overrides: InspectorTokenOverrides | undefined,
  isDark: boolean
): Required<InspectorTokenOverrides> {
  return {
    overlayColor: overrides?.overlayColor ?? (isDark ? 'rgba(100, 140, 255, 0.2)' : 'rgba(60, 100, 255, 0.18)'),
    overlayBorderColor:
      overrides?.overlayBorderColor ?? (isDark ? 'rgba(100, 140, 255, 0.9)' : 'rgba(40, 80, 220, 0.9)'),
    tagBackground:
      overrides?.tagBackground ?? (isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(30, 30, 30, 0.92)'),
    tagForeground: overrides?.tagForeground ?? '#ffffff',
    pickerBackground: overrides?.pickerBackground ?? (isDark ? '#161616' : '#ffffff'),
    pickerForeground: overrides?.pickerForeground ?? (isDark ? '#cccccc' : '#222222'),
    accentColor: overrides?.accentColor ?? (isDark ? '#4ade80' : '#1a73e8'),
  }
}
