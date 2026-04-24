import { Button, H1, YStack, Paragraph } from 'tamagui'

export default function Home() {
  return (
    <YStack flex={1} justify="center" items="center" p="$4" gap="$4" bg="$background">
      <H1>react-nibble one-example</H1>
      <Paragraph>
        Shake the device (or Cmd+D / Ctrl+M) then select &quot;Toggle
        react-nibble Inspector&quot; and tap a button.
      </Paragraph>
      <Button onPress={() => console.info('primary pressed')}>Primary</Button>
      <Button theme="red" onPress={() => console.info('danger pressed')}>
        Danger
      </Button>
      <Button theme="green" onPress={() => console.info('ok pressed')}>
        OK
      </Button>
    </YStack>
  )
}
