import * as React from 'react';
import { Button } from '..';

import Providers from './decorators/Providers';

export default {
  title: 'OpenAgenda Components',
  decorators: [Providers]
};

export const Buttons = () => (
  <>
    <Button>Default Button</Button>&nbsp;
    <Button colorScheme="primary">Primary Button</Button>&nbsp;
  </>
);
