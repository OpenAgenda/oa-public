import * as React from 'react';
import { Button } from '@chakra-ui/react';

import Providers from './decorators/Providers';

export default {
  title: 'OpenAgenda Components',
  decorators: [Providers]
};

export const Buttons = () => (
  <>
    <Button>Default Button</Button>&nbsp;
    <Button variant="primary">Primary Button</Button>
  </>
);
