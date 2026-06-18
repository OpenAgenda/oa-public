import { Surface, Button, Heading, Text, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Surface',
  decorators: [Provider],
};

// The surface owns only its identity (bg + radius, flat). Callers supply
// layout — here generous padding + a max width, the way an auth card would.
export function Default() {
  return (
    <Surface maxW="md" mx="auto" my="20" p={{ base: '8', md: '12' }}>
      <Heading as="h1" size="xl" mb="6">
        Sign in
      </Heading>
      <Text color="fg.muted">
        Flat by default: no border, no shadow. It sits on the page background as
        a single panel.
      </Text>
    </Surface>
  );
}

Default.storyName = 'Surface';

// `asChild` keeps the semantic element while inheriting the surface look — e.g.
// rendering the surface as the page's <main>.
export function AsSemanticElement() {
  return (
    <Surface asChild maxW="xl" mx="auto" my="20" p="8" textAlign="center">
      <main>
        <VStack gap="4">
          <Heading as="h1" size="xl">
            Event not found
          </Heading>
          <Text color="fg.muted">There is no agenda matching this link.</Text>
          <Button>See the agenda</Button>
        </VStack>
      </main>
    </Surface>
  );
}

AsSemanticElement.storyName = 'Surface (asChild)';
