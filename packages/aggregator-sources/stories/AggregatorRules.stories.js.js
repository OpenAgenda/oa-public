import React from 'react';

import { storiesOf } from '@storybook/react';

import AggregatorRules from '../src/components/AggregatorRules';
import SimpleDecorator from './decorators/Simple';
import IntlDecorator from './decorators/IntlDecorator';

export default storiesOf('AggregatorRules', module)
  .addDecorator(SimpleDecorator)
  .addDecorator(IntlDecorator)
  .add('No rules', () => (
    <AggregatorRules rules={[]} schema={{ fields: [] }} showModal={() => {}} />
  ))
  .add('One rule', () => (
    <AggregatorRules
      rules={[
        {
          query: {
            location: {
              city: 'Mondonville',
            },
          },
          required: true,
          actions: [],
        },
      ]}
      schema={{ fields: [] }}
      showModal={() => {}}
    />
  ));
