import { Badge, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Badge',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack spacing="4">
      <Badge colorScheme="warning" variant="solid">Warning</Badge>
      <Badge colorScheme="danger" variant="solid">Danger</Badge>
    </VStack>
  );
}
