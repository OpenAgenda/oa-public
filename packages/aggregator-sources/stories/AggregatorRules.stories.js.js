import AggregatorRules from '../src/components/AggregatorRules';
import SimpleDecorator from './decorators/Simple';
import IntlDecorator from './decorators/IntlDecorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'AggregatorRules',
  component: AggregatorRules,
  decorators: [SimpleDecorator, IntlDecorator],
};

export const NoRules = () => (
  <AggregatorRules rules={[]} schema={{ fields: [] }} showModal={() => {}} />
);
NoRules.storyName = 'No rules';

export const OneRule = () => (
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
);
OneRule.storyName = 'One rule';
