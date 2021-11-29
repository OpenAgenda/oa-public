import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import InputField from '../src/components/InputField';
import ComponentCanvas from './decorators/ComponentCanvas';

export default {
  title: 'InputField',
  decorators: [ComponentCanvas]
};

export const test = () => (
  <InputField
    lang="fr"
    name="test"
    getLabel={() => 'toto'}
    validator={() => true}
    placeholder="tata"
    value="Londres"
  />
);
