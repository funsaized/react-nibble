import { Stack } from 'one'
import { Configuration } from 'tamagui'
import { InspectorRoot } from 'react-nibble'
import { config } from '~/tamagui/tamagui.config'

export default function AppLayout() {
  return (
    <Configuration disableSSR>
      {process.env['VITE_NATIVE'] ? (
        <InspectorRoot tamaguiConfig={config}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="index" />
          </Stack>
        </InspectorRoot>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      )}
    </Configuration>
  )
}
