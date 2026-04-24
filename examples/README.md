# react-nibble examples

Two runnable examples demonstrating `react-nibble` integration.

## `one-example/`

Minimal One framework app with three Tamagui buttons. Smoke-test canary.

```bash
cd examples/one-example
bun install
bun ios        # or: bun android / bun dev
```

Shake the device → "Toggle react-nibble Inspector" → tap a button → Zed opens.

## `takeout2-lite-example/`

Primary example. Scaffolded from the takeout2 "lite" starter (orez-based
all-in-one backend). Mirrors the real-world Tamagui + One + Zero stack.

```bash
cd examples/takeout2-lite-example
bun install
bun lite       # local backend (orez) + frontend
# in another terminal:
bun ios        # or: bun android
```

## Integration contract

Every example wires react-nibble via five touchpoints (all `__DEV__`-gated):

1. **`package.json`** — `"react-nibble": "workspace:*"` in dependencies
2. **`vite.config.ts`** — `nibbleVitePlugin({ editor: process.env.LAUNCH_EDITOR ?? 'zed', allowedRoots: [process.cwd()] })`
3. **`.env.development`** — `LAUNCH_EDITOR=zed`
4. **Root layout** — `<InspectorRoot tamaguiConfig={config}>{children}</InspectorRoot>` inside the Tamagui provider
5. **Native setup** — `initializeInspector()` called once inside `if (__DEV__)` in `setupNative.ts`

See `rn-zed-debugger-design.md` §7.9 for the canonical takeout2 integration patch.
