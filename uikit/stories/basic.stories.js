import * as React from 'react';
import {
  Button,
  VStack
} from '..';

import Providers from './decorators/Providers';

export default {
  title: 'OpenAgenda Components',
  decorators: [Providers]
};

export const Buttons = () => (
  <VStack spacing="4">
    <Button>Default Button</Button>&nbsp;
    <Button colorScheme="primary">Primary Button</Button>&nbsp;
    <Button variant="link">Link button</Button>
  </VStack>
);
