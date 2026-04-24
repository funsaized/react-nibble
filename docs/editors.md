# Editor setup

react-nibble uses [`launch-editor`](https://www.npmjs.com/package/launch-editor) to open source files in your editor. Set the `LAUNCH_EDITOR` environment variable in `.env.development` to tell the dev server which editor to use.

If no `LAUNCH_EDITOR` is set, `launch-editor` attempts to auto-detect a running editor from your process list.

---

## Zed

Zed is the primary target editor for react-nibble.

**`LAUNCH_EDITOR` value**: `zed`

**Install the CLI**:

1. Download Zed from [zed.dev](https://zed.dev)
2. Open Zed, then `Cmd+Shift+P` → "Install CLI"

**Verify**:

```bash
zed --version
```

**How it works**: `launch-editor` invokes `zed path:line:column`. Zed reuses the existing window via IPC — no new window spawns on each tap.

**Notes**: The Zed URL scheme (`zed://file/...`) does not support `:line:column` — the CLI is the only supported way to open at a specific location.

---

## VSCode family

### VSCode

**`LAUNCH_EDITOR` value**: `code`

**Install the CLI**:

1. Open VSCode
2. `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"

**Verify**:

```bash
code --version
```

**Notes**: `launch-editor` passes `-r -g` flags to reuse the existing window and go to the specified line/column.

### VSCode Insiders

**`LAUNCH_EDITOR` value**: `code-insiders`

Same setup as VSCode but with the Insiders build. CLI is `code-insiders`.

### Cursor

**`LAUNCH_EDITOR` value**: `cursor`

**Install the CLI**: Cursor installs its CLI automatically. If not in PATH, open Cursor → `Cmd+Shift+P` → "Install 'cursor' command in PATH".

**Verify**:

```bash
cursor --version
```

### VSCodium

**`LAUNCH_EDITOR` value**: `codium` or `vscodium`

**Install the CLI**: Follow [VSCodium docs](https://vscodium.com/) for your platform.

**Verify**:

```bash
codium --version
```

---

## JetBrains family

All JetBrains IDEs use the `--line` and `--column` flags. `launch-editor` supports these editors with line and column positioning.

### WebStorm

**`LAUNCH_EDITOR` value**: `webstorm`

**Install the CLI**: WebStorm → Tools → "Create Command-line Launcher..."

**Verify**:

```bash
webstorm --version
```

### IntelliJ IDEA

**`LAUNCH_EDITOR` value**: `idea`

**Install the CLI**: IntelliJ → Tools → "Create Command-line Launcher..."

**Verify**:

```bash
idea --version
```

### PhpStorm

**`LAUNCH_EDITOR` value**: `phpstorm`

**Install**: PhpStorm → Tools → "Create Command-line Launcher..."

### PyCharm

**`LAUNCH_EDITOR` value**: `pycharm`

**Install**: PyCharm → Tools → "Create Command-line Launcher..."

### RubyMine

**`LAUNCH_EDITOR` value**: `rubymine`

**Install**: RubyMine → Tools → "Create Command-line Launcher..."

### GoLand

**`LAUNCH_EDITOR` value**: `goland`

**Install**: GoLand → Tools → "Create Command-line Launcher..."

### CLion

**`LAUNCH_EDITOR` value**: `clion`

**Install**: CLion → Tools → "Create Command-line Launcher..."

### Rider

**`LAUNCH_EDITOR` value**: `rider`

**Install**: Rider → Tools → "Create Command-line Launcher..."

### AppCode

**`LAUNCH_EDITOR` value**: `appcode`

**Install**: AppCode → Tools → "Create Command-line Launcher..."

---

## Vim family

### Vim

**`LAUNCH_EDITOR` value**: `vim`

`launch-editor` opens vim with `+call cursor(line, column) file`. This works in a terminal — the dev server will attempt to launch vim in its own process.

**Verify**:

```bash
vim --version
```

**Notes**: Works best when your terminal and dev server are in the same TTY context. If you run the dev server in the background, vim may not attach to a visible terminal.

### MacVim

**`LAUNCH_EDITOR` value**: `mvim`

**Install**: `brew install macvim` or download from [macvim.org](https://macvim.org).

**Verify**:

```bash
mvim --version
```

---

## Sublime Text

**`LAUNCH_EDITOR` value**: `subl` or `sublime_text`

**Install the CLI**:

```bash
# macOS — symlink the CLI
ln -s "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl" /usr/local/bin/subl
```

**Verify**:

```bash
subl --version
```

---

## Emacs

**`LAUNCH_EDITOR` value**: `emacs` or `emacsclient`

`launch-editor` opens emacs with `+line:column file`.

**Verify**:

```bash
emacs --version
```

**Notes**: For best results with a running Emacs daemon, set `LAUNCH_EDITOR=emacsclient`. This reuses the existing Emacs frame instead of spawning a new process.

---

## Notepad++

**`LAUNCH_EDITOR` value**: `notepad++`

`launch-editor` opens Notepad++ with `-n<line> -c<column> file`.

**Notes**: Windows only.

---

## Atom

**`LAUNCH_EDITOR` value**: `atom`

**Notes**: Atom has been sunset. It still works with `launch-editor` if installed, but consider migrating to another editor.

---

## Editors not in launch-editor

If your editor isn't listed above, or if `launch-editor`'s default behavior doesn't work for your setup, use the `onLaunch` escape hatch in the Vite plugin config:

```ts
// vite.config.ts
import { nibbleVitePlugin } from 'react-nibble/server'

export default {
  plugins: [
    nibbleVitePlugin({
      onLaunch: async ({ file, line, column }) => {
        // Example: open in Neovim via nvim-remote
        const { execSync } = await import('node:child_process')
        execSync(`nvim --server /tmp/nvim.pipe --remote-send ":e +${line} ${file}<CR>"`)
      },
    }),
  ],
}
```

This completely bypasses `launch-editor`. You control how the editor is invoked.

**Common editors that need `onLaunch`**:

| Editor | Why | Approach |
|---|---|---|
| Neovim (`nvim`) | Not in `launch-editor`'s argument map — line/column not passed | Use `nvim-remote` or `nvim --server` |
| Xcode (`xed`) | Not in `launch-editor` | Use `xed --line <line> <file>` |
| Android Studio | Not in `launch-editor` with line/column support | Use JetBrains CLI: `studio --line <line> --column <col> <file>` |
