# Telemetry

react-nibble includes opt-in anonymous telemetry. It is **off by default**. Zero PII is collected.

## How to enable

### Via config

```ts
initializeInspector({ telemetry: { enabled: true } })
```

### Via environment variable

```bash
NIBBLE_TELEMETRY=1
```

Set this in `.env.development` or your CI environment to enable telemetry team-wide without changing code.

## How to disable

Do nothing. Telemetry is off by default.

If you previously enabled it, remove the config option or unset the environment variable:

```ts
// Remove the telemetry key entirely, or:
initializeInspector({ telemetry: { enabled: false } })
```

```bash
unset NIBBLE_TELEMETRY
```

## What is collected

When telemetry is enabled, each event contains exactly these fields:

| Field        | Type    | Description                                                                               |
| ------------ | ------- | ----------------------------------------------------------------------------------------- |
| `event`      | string  | One of: `inspector-opened`, `component-tapped`, `editor-launched`, `editor-launch-failed` |
| `ts`         | string  | ISO 8601 timestamp (e.g. `2025-06-15T10:30:00.000Z`)                                      |
| `pkgVersion` | string  | `react-nibble` package version                                                            |
| `node`       | string? | Node.js version (dev server only, e.g. `v22.0.0`)                                         |
| `os`         | string? | `process.platform` (dev server only, e.g. `darwin`, `linux`)                              |
| `editor`     | string? | Configured editor name (e.g. `zed`, `code`)                                               |
| `sessionId`  | string  | Per-session anonymous random string. Rotates every dev-server start.                      |

These fields match the `TelemetryEvent` type in [`packages/core/src/telemetry/types.ts`](../packages/core/src/telemetry/types.ts).

## What is NEVER collected

- File paths (absolute or relative)
- Component names
- Source code, props, or state
- IP addresses
- User identifiers (no cookies, no fingerprints, no hardware IDs)
- Environment variables
- Hardware information

## Payload example

```json
{
  "event": "editor-launched",
  "ts": "2025-06-15T10:30:00.000Z",
  "pkgVersion": "0.1.0",
  "node": "v22.0.0",
  "os": "darwin",
  "editor": "zed",
  "sessionId": "k7f2x9m1j5"
}
```

## Endpoint

Events are sent to:

```
https://t.react-nibble.dev/collect
```

This is a placeholder endpoint. The real domain will be registered before `1.0.0`.

## Self-hosting

Override the endpoint for corporate environments where outbound telemetry is disallowed:

```ts
initializeInspector({
  telemetry: {
    enabled: true,
    endpoint: 'https://your-own.example.com/collect',
  },
})
```

## Transparency notice

On the first run with telemetry enabled, the inspector prints a one-time `console.info`:

```
react-nibble telemetry enabled. See docs/telemetry.md to learn what is collected.
```

This only prints once per process lifetime.

## Release-build safety

All telemetry code lives server-side in the Vite dev-server plugin. Production bundles contain **zero telemetry code**. The `sideEffects: false` flag in `package.json` ensures tree-shaking removes all telemetry imports in release builds.

The native React Native bundle does not ship a telemetry collector. Events originate from the Vite server middleware when it handles `/__nibble/open-source` requests.

## Source

The telemetry module is under 100 lines of code and fully auditable:

[`packages/core/src/telemetry/collector.ts`](../packages/core/src/telemetry/collector.ts)
