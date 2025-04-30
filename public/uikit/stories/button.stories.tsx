import { Button, VStack, HStack, Heading } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Button',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack gap="4">
      <HStack gap="4">
        <Button>Default button</Button>
      </HStack>
      <HStack gap="4">
        <Button size="xs">xs size Button</Button>
        <Button size="sm">sm size Button</Button>
        <Button size="md">md size Button</Button>
        <Button size="lg">lg size Button</Button>
      </HStack>

      <HStack gap="4">
        <Button colorPalette="primary" size="xs">
          Primary Button
        </Button>
        <Button colorPalette="primary" size="sm">
          Primary Button
        </Button>
        <Button colorPalette="primary" size="md">
          Primary Button
        </Button>
        <Button colorPalette="primary" size="lg">
          Primary Button
        </Button>
      </HStack>

      <HStack gap="4">
        <Button variant="link" fontSize="xs">
          Link button
        </Button>
        <Button variant="link" fontSize="sm">
          Link button
        </Button>
        <Button variant="link" fontSize="md">
          Link button
        </Button>
        <Button variant="link" fontSize="lg">
          Link button
        </Button>
      </HStack>

      <HStack gap="4">
        <Button variant="link" colorPalette="primary" fontSize="xs">
          Link button
        </Button>
        <Button variant="link" colorPalette="primary" fontSize="sm">
          Link button
        </Button>
        <Button variant="link" colorPalette="primary" fontSize="md">
          Link button
        </Button>
        <Button variant="link" colorPalette="primary" fontSize="lg">
          Link button
        </Button>
      </HStack>

      <b>
        A{' '}
        <Button variant="link" colorPalette="primary">
          link button
        </Button>{' '}
        in bold text
      </b>

      <Heading as="h1" size="4xl">
        A{' '}
        <Button variant="link" colorPalette="primary">
          link button
        </Button>{' '}
        in a h1
      </Heading>

      <HStack gap="4">
        <Button variant="ghost" colorPalette="primary" fontSize="xs">
          Ghost button
        </Button>
        <Button variant="ghost" colorPalette="primary" fontSize="sm">
          Ghost button
        </Button>
        <Button variant="ghost" colorPalette="primary" fontSize="md">
          Ghost button
        </Button>
        <Button variant="ghost" colorPalette="primary" fontSize="lg">
          Ghost button
        </Button>
      </HStack>

      <HStack gap="4">
        <Button variant="outline" colorPalette="primary" fontSize="xs">
          Outline button
        </Button>
        <Button variant="outline" colorPalette="primary" fontSize="sm">
          Outline button
        </Button>
        <Button variant="outline" colorPalette="primary" fontSize="md">
          Outline button
        </Button>
        <Button variant="outline" colorPalette="primary" fontSize="lg">
          Outline button
        </Button>
      </HStack>
    </VStack>
  );
}

All.storyName = 'Button';
