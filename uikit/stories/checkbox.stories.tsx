import { Checkbox, VStack, Spacer } from '../src';
import Provider from './decorators/Provider';

export default {
  title: 'OpenAgenda/Components/Checkbox',
  decorators: [Provider],
};

export function All() {
  return (
    <VStack spacing="4">
      <Checkbox size="sm">Default Checkbox</Checkbox>
      <Checkbox size="md">Default Checkbox</Checkbox>
      <Checkbox size="lg">Default Checkbox</Checkbox>

      <Spacer />

      <Checkbox colorScheme="primary" size="sm">
        Primary Checkbox
      </Checkbox>
      <Checkbox colorScheme="primary" size="md">
        Primary Checkbox
      </Checkbox>
      <Checkbox colorScheme="primary" size="lg">
        Primary Checkbox
      </Checkbox>
    </VStack>
  );
}
