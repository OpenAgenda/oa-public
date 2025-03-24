import { Badge, VStack } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Badge',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack gap="4">
      <Badge colorPalette="warning" variant="solid">
        Warning
      </Badge>
      <Badge colorPalette="danger" variant="solid">
        Danger
      </Badge>
    </VStack>
  );
}

All.storyName = 'Badge';
