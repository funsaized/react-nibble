import { one } from 'one/vite'
import { nibbleVitePlugin } from 'react-nibble/server'
import type { UserConfig } from 'vite'

export default {
  plugins: [
    one({
      web: { defaultRenderMode: 'spa' },
    }),
    nibbleVitePlugin({
      editor: process.env['LAUNCH_EDITOR'] ?? 'zed',
      allowedRoots: [process.cwd()],
    }),
  ],
} satisfies UserConfig
