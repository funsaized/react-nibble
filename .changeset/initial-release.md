---
'react-nibble': minor
---

Initial public release (0.1.0).

- Tamagui-first React Native inspector targeting One framework apps
- App → Editor navigation for Zed, VSCode, Cursor, WebStorm, Vim, and others via `launch-editor`
- Vite dev-server plugin (`nibbleVitePlugin`) with path-guarded `/__nibble/open-source` endpoint
- `<InspectorRoot>` component with required `tamaguiConfig` prop
- Opt-in anonymous telemetry (off by default; see [docs/telemetry.md](../docs/telemetry.md))
- Feature parity with `react-native-dev-inspector` for app→editor direction

See [CHANGELOG.md](../CHANGELOG.md) for details.
