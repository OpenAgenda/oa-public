import { useState } from 'react';
import FilterSelect from '../src/components/FilterSelect.js';
import IntlProvider from './decorators/IntlProvider.js';
import SmallCanvas from './decorators/SmallCanvas.js';
import agenda from './fixtures/bdm.agenda.json';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'FilterSelect',
  component: FilterSelect,
  decorators: [IntlProvider, SmallCanvas],
};

function getFilterSelectOptions(intl, schema = {}, exclude = []) {
  return schema?.fields
    .filter(({ field }) => !exclude.includes(field))
    .map(({ field }) => ({
      value: field,
      label: field,
    }));
}

export const WithFilters = () => {
  const [selected, setSelected] = useState(['search', 'geo', 'timings']);
  return (
    <FilterSelect
      value={selected}
      onChange={(update) => {
        setSelected(update);
      }}
      schema={agenda.schema}
      getFilterOptions={getFilterSelectOptions}
    />
  );
};

export const Empty = () => {
  const [selected, setSelected] = useState([]);
  return (
    <FilterSelect
      value={selected}
      onChange={(update) => setSelected(update)}
      schema={agenda.schema}
      getFilterOptions={getFilterSelectOptions}
    />
  );
};
