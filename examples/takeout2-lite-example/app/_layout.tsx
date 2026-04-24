import { Stack } from 'one'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { TamaguiProvider } from 'tamagui'
import { config } from '~/tamagui/tamagui.config'

export default function Layout() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <SafeAreaProvider>
        {process.env['VITE_NATIVE'] ? (
          <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="(app)" />
          </Stack>
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}
