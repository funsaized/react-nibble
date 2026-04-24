# takeout2-lite-example

Primary example for `react-nibble`. Demonstrates integration with the full
Tamagui + One stack that `takeout2` uses, minus the operational surface
(Zero, auth, deployment). Scaffolded manually from takeout2 patterns (the
`bun create takeout --lite` command does not exist as a non-interactive flag).

## Run

```bash
bun install
bun dev         # starts One dev server with react-nibble Vite plugin
# in another terminal:
bun ios         # or: bun android
```

Shake the device -> "Toggle react-nibble Inspector" -> tap a Tamagui component -> Zed opens.
