import { VStack, Spacer } from '../src';
import { Checkbox } from '../src/snippets';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Checkbox',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack gap="4">
      <Checkbox size="sm">Default Checkbox</Checkbox>
      <Checkbox size="md">Default Checkbox</Checkbox>
      <Checkbox size="lg">Default Checkbox</Checkbox>

      <Spacer />

      <Checkbox colorPalette="primary" size="sm">
        Primary Checkbox
      </Checkbox>
      <Checkbox colorPalette="primary" size="md">
        Primary Checkbox
      </Checkbox>
      <Checkbox colorPalette="primary" size="lg">
        Primary Checkbox
      </Checkbox>
    </VStack>
  );
}

All.storyName = 'Checkbox';
