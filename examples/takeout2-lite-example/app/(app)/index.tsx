import { Button, H1, YStack, Paragraph, SizableText } from 'tamagui'

export default function Home() {
  return (
    <YStack flex={1} justify="center" items="center" p="$4" gap="$4" bg="$background">
      <H1>takeout2-lite-example</H1>
      <Paragraph>Primary example for react-nibble, mirroring the Tamagui + One stack.</Paragraph>
      <SizableText size="$3" color="$color8">
        Shake the device or press Cmd+D to open the dev menu, then select &quot;Toggle react-nibble
        Inspector&quot; and tap a component.
      </SizableText>
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
