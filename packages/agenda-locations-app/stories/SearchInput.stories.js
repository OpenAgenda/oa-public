import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import SearchInput from '../src/components/SearchInput';
import ComponentCanvas from './decorators/ComponentCanvas';

export default {
  title: 'SearchInput',
  decorators: [ComponentCanvas]
};

export const test = () => (
  <SearchInput
    placeholder="Search..."
    onChange={value => console.log(value)}
  />
);
