import { Stack } from 'one'
import { TamaguiProvider } from 'tamagui'
import { InspectorRoot } from 'react-nibble'
import { config } from '~/tamagui.config'
import '~/setupNative'

export default function Layout() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <InspectorRoot tamaguiConfig={config}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </InspectorRoot>
    </TamaguiProvider>
  )
}
