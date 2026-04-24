# react-nibble

> Open React Native source in Zed with a tap. Tamagui-first. One framework ready.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/react-nibble.svg)](https://www.npmjs.com/package/react-nibble)
[![CI](https://github.com/funsaized/react-nibble/actions/workflows/ci.yml/badge.svg)](https://github.com/funsaized/react-nibble/actions/workflows/ci.yml)

![Demo](docs/assets/demo.gif)

## Install

```bash
bun add react-nibble tamagui
```

## Quickstart

Full working example: [`examples/takeout2-lite-example`](./examples/takeout2-lite-example).

### 1. Install

```bash
bun add react-nibble tamagui
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { nibbleVitePlugin } from 'react-nibble/server'

export default {
  plugins: [
    nibbleVitePlugin(),
    // ... your other plugins
  ],
}
```

### 3. Set your editor

```bash
# .env.development
LAUNCH_EDITOR=zed
```

### 4. Wrap your app

```tsx
import { InspectorRoot } from 'react-nibble'
import config from './tamagui.config'

export default function Layout({ children }) {
  return <InspectorRoot tamaguiConfig={config}>{children}</InspectorRoot>
}
```

### 5. Initialize on native

```ts
// src/setupNative.ts (or your native bootstrap file)
import { initializeInspector } from 'react-nibble'

initializeInspector()
```

Shake your device or open the DevMenu and tap "Toggle react-nibble Inspector". Tap any component — your editor opens at the source.

## Features

| Feature                        | Status | Notes                                            |
| ------------------------------ | ------ | ------------------------------------------------ |
| App → Editor navigation        | ✅     | Tap a component, editor opens at source          |
| Tamagui integration            | ✅     | Inspector adopts host tokens, themes, dark mode  |
| Multi-editor support           | ✅     | Zed, VSCode, Cursor, WebStorm, Vim, and more     |
| Vite dev-server plugin         | ✅     | `/__nibble/open-source` endpoint with path guard |
| Hierarchy picker (Above/Under) | 🚧     | Phase 2                                          |
| Style panel + box model        | 🚧     | Phase 2                                          |
| Editor → App cursor sync       | ❌     | Deferred — blocked by Zed extension API limits   |

## Supported editors

Any editor supported by [`launch-editor`](https://www.npmjs.com/package/launch-editor) works. Set `LAUNCH_EDITOR` in `.env.development`:

| Editor          | `LAUNCH_EDITOR` value    |
| --------------- | ------------------------ |
| Zed             | `zed`                    |
| VSCode          | `code`                   |
| VSCode Insiders | `code-insiders`          |
| Cursor          | `cursor`                 |
| VSCodium        | `codium` or `vscodium`   |
| WebStorm        | `webstorm`               |
| IntelliJ IDEA   | `idea`                   |
| PhpStorm        | `phpstorm`               |
| PyCharm         | `pycharm`                |
| RubyMine        | `rubymine`               |
| GoLand          | `goland`                 |
| CLion           | `clion`                  |
| Rider           | `rider`                  |
| Sublime Text    | `subl` or `sublime_text` |
| Vim             | `vim`                    |
| Neovim          | `nvim`                   |
| MacVim          | `mvim`                   |
| Emacs           | `emacs`                  |
| Notepad++       | `notepad++`              |
| Atom            | `atom`                   |

For editors not in this list, use the `onLaunch` escape hatch. See [docs/editors.md](./docs/editors.md) for per-editor setup instructions.

## Telemetry

Off by default. Zero PII collected. See [docs/telemetry.md](./docs/telemetry.md) for full details.

Opt in:

```ts
initializeInspector({ telemetry: { enabled: true } })
```

## Architecture

react-nibble is a monorepo with three internal packages bundled into a single facade:

- **`@react-nibble/core`** — Headless runtime: fiber walker, source extractor, candidate ranking, transport client, telemetry collector.
- **`@react-nibble/ui`** — Tamagui-based inspector UI: touch capture layer, highlight overlay, picker dialog. Adopts the host app's Tamagui config for consistent theming.
- **`@react-nibble/server`** — Vite plugin providing the `/__nibble/open-source` endpoint. Validates file paths against allowed roots, dispatches to the configured editor via `launch-editor`.

Users install `react-nibble` (the facade) which re-exports everything. Internal packages are bundled at build time — no workspace dependency leaks into the published tarball.

Key design decisions:

- **Tamagui-required** — The inspector UI is built with Tamagui. `tamaguiConfig` is a required prop on `<InspectorRoot>` so the inspector inherits the host app's tokens, themes, and dark mode.
- **Vite-only (v1)** — Targets One framework apps that use Vite as their bundler. Metro is out of scope for v1.
- **`_debugSource` first** — Uses React's built-in `_debugSource` fiber property for source mapping. No Babel plugin required for P1. Optional Babel plugin planned for P3 as a fallback.
- **Path-guarded file access** — The Vite plugin validates all file paths against the project root before opening, preventing directory traversal.

## Requirements

- React 18+
- React Native 0.73+
- Tamagui 1.90+
- One framework (Vite-based) app

## Out of scope (v1)

The following are not supported in the initial release:

- Bare React Native apps (without Tamagui)
- Expo apps using Metro bundler
- Non-Tamagui UI libraries

If you're migrating from `react-native-dev-inspector`, see the API comparison in the design documentation linked from the repo wiki.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, coding standards, and how to submit changes.

## License

[MIT](./LICENSE)
