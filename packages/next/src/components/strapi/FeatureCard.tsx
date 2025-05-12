import { Card, Stack, Heading, Text, Image } from '@openagenda/uikit';

export default function FeatureCard({ title, text, image }) {
  return (
    <Card.Root maxW="sm">
      <Card.Body>
        <Image src={`${image.url}`} alt={title} borderRadius="lg" />
        <Stack mt="6" gap="3">
          <Heading size="md">{title}</Heading>
          <Text>{text}</Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
