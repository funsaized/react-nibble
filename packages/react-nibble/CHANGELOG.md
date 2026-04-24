# react-nibble

## 0.2.0

### Minor Changes

- [`873b4ba`](https://github.com/funsaized/react-nibble/commit/873b4baac1c339cd3a187e7111778abe7a9b13c8) Thanks [@funsaized](https://github.com/funsaized)! - Initial public release (0.1.0).
  - Tamagui-first React Native inspector targeting One framework apps
  - App → Editor navigation for Zed, VSCode, Cursor, WebStorm, Vim, and others via `launch-editor`
  - Vite dev-server plugin (`nibbleVitePlugin`) with path-guarded `/__nibble/open-source` endpoint
  - `<InspectorRoot>` component with required `tamaguiConfig` prop
  - Opt-in anonymous telemetry (off by default; see [docs/telemetry.md](../docs/telemetry.md))
  - Feature parity with `react-native-dev-inspector` for app→editor direction

  See [CHANGELOG.md](../CHANGELOG.md) for details.
