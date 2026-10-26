import { HStack, VStack } from '../src';
import { RadioCardItem, RadioCardLabel, RadioCardRoot } from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/RadioCard',
  decorators: [Provider],
};

const CHOICES = ['Sync', 'Portal', 'Custom'];

export function Pill() {
  return (
    <VStack gap="6" align="start">
      {(['sm', 'md'] as const).map((size) => (
        <RadioCardRoot
          key={size}
          variant="pill"
          size={size}
          colorPalette="primary"
          defaultValue="Sync"
        >
          <RadioCardLabel>{`What will this key be used for? (${size})`}</RadioCardLabel>
          <HStack gap="2" wrap="wrap">
            {CHOICES.map((choice) => (
              <RadioCardItem
                key={choice}
                value={choice}
                label={choice}
                indicator={null}
              />
            ))}
          </HStack>
        </RadioCardRoot>
      ))}
    </VStack>
  );
}
