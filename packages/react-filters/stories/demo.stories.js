import React from 'react';
import {
  FiltersProvider,
  Filters,
  DateRangeFilter,
  MultiChoiceFilter,
} from '../src';

require('@openagenda/bs-templates/compiled/main.css');

const lang = 'fr';

export default {
  title: 'OpenAgenda/Demo',
  argTypes: { onSubmit: { action: 'submit' } },
};

const filters = [
  { name: 'timings', type: 'dateRange' },
  { name: 'createdAt', type: 'dateRange' },
  { name: 'updatedAt', type: 'dateRange' },
  {
    name: 'state',
    type: 'radio',
    options: [
      {
        label: 'Refusé',
        value: -1,
      },
      {
        label: 'À contrôler',
        value: 0,
      },
      {
        label: 'Prêt à publier',
        value: 1,
      },
      {
        label: 'Publié',
        value: 2,
      },
    ],
    aggregation: {
      type: 'states',
    },
  },
];

export const CompleteExample = ({ onSubmit }) => (
  <FiltersProvider onSubmit={onSubmit} locale={lang}>
    <div className="oa-collapse">
      <Filters
        filters={filters}
        dateRangeComponent={DateRangeFilter}
        checkboxComponent={MultiChoiceFilter}
        radioComponent={MultiChoiceFilter}
      />
    </div>
  </FiltersProvider>
);
CompleteExample.storyName = 'Filters';

export const FilterByFilter = ({ onSubmit }) => (
  <FiltersProvider onSubmit={onSubmit} locale={lang}>
    <div className="oa-collapse">
      <DateRangeFilter name="timings" />
      <DateRangeFilter name="createdAt" />
      <DateRangeFilter name="updatedAt" />
      <MultiChoiceFilter name="state" options={filters[3].options} />
    </div>
  </FiltersProvider>
);
FilterByFilter.storyName = 'Filter by filter';
