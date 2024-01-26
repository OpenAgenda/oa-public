import { Button, VStack, HStack, Heading } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Button',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack spacing="4">
      <HStack spacing="4">
        <Button size="xs">Default Button</Button>
        <Button size="sm">Default Button</Button>
        <Button size="md">Default Button</Button>
        <Button size="lg">Default Button</Button>
      </HStack>

      <HStack spacing="4">
        <Button colorScheme="primary" size="xs">
          Primary Button
        </Button>
        <Button colorScheme="primary" size="sm">
          Primary Button
        </Button>
        <Button colorScheme="primary" size="md">
          Primary Button
        </Button>
        <Button colorScheme="primary" size="lg">
          Primary Button
        </Button>
      </HStack>

      <HStack spacing="4">
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

      <HStack spacing="4">
        <Button variant="link" colorScheme="primary" fontSize="xs">
          Link button
        </Button>
        <Button variant="link" colorScheme="primary" fontSize="sm">
          Link button
        </Button>
        <Button variant="link" colorScheme="primary" fontSize="md">
          Link button
        </Button>
        <Button variant="link" colorScheme="primary" fontSize="lg">
          Link button
        </Button>
      </HStack>

      <b>
        A{' '}
        <Button variant="link" colorScheme="primary">
          link button
        </Button>{' '}
        in bold text
      </b>

      <Heading as="h1" size="4xl">
        A{' '}
        <Button variant="link" colorScheme="primary">
          link button
        </Button>{' '}
        in a h1
      </Heading>

      <HStack spacing="4">
        <Button variant="ghost" colorScheme="primary" fontSize="xs">
          Ghost button
        </Button>
        <Button variant="ghost" colorScheme="primary" fontSize="sm">
          Ghost button
        </Button>
        <Button variant="ghost" colorScheme="primary" fontSize="md">
          Ghost button
        </Button>
        <Button variant="ghost" colorScheme="primary" fontSize="lg">
          Ghost button
        </Button>
      </HStack>

      <HStack spacing="4">
        <Button variant="outline" colorScheme="primary" fontSize="xs">
          Outline button
        </Button>
        <Button variant="outline" colorScheme="primary" fontSize="sm">
          Outline button
        </Button>
        <Button variant="outline" colorScheme="primary" fontSize="md">
          Outline button
        </Button>
        <Button variant="outline" colorScheme="primary" fontSize="lg">
          Outline button
        </Button>
      </HStack>
    </VStack>
  );
}
