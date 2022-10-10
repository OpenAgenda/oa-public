import * as React from 'react';
import { Button, VStack, HStack, Heading } from '..';
import Providers from './decorators/Providers';

export default {
  title: 'OpenAgenda Components',
  decorators: [Providers],
};

export function Buttons() {
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
    </VStack>
  );
}
