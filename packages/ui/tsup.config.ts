import { createConfig } from '../../tsup.config.base'

export default createConfig({
  external: ['react', 'react-native', 'tamagui', '@tamagui/core', '@tamagui/web', '@react-nibble/core'],
})
