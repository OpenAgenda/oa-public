import { useState } from 'react';
import SortableSelect from '../src/components/SortableSelect.js';
import IntlProvider from './decorators/IntlProvider.js';
import SmallCanvas from './decorators/SmallCanvas.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'SortableSelect',
  component: SortableSelect,
  decorators: [IntlProvider, SmallCanvas],
};

const customSortableOptions = [
  { value: 'location.city', label: 'city' },
  { value: 'location.region', label: 'region' },
  { value: 'location.department', label: 'departement' },
];

export const WithOptions = () => {
  const [selected, setSelected] = useState([
    'location.city',
    'location.region',
  ]);

  return (
    <SortableSelect
      options={customSortableOptions}
      value={selected}
      onChange={(update) => setSelected(update)}
    />
  );
};

export const Empty = () => {
  const [selected, setSelected] = useState([]);
  return (
    <SortableSelect
      value={selected}
      options={customSortableOptions}
      onChange={(update) => setSelected(update)}
    />
  );
};
