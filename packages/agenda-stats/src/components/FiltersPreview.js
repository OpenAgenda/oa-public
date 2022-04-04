import React from 'react';
import {
  ActiveFilters,
  DateRangeFilter,
  ChoiceFilter,
} from '@openagenda/react-filters';

export default function FiltersPreview({ isFetching, filters, getOptions }) {
  return (
    <ActiveFilters
      filters={filters}
      disabled={isFetching}
      dateRangeComponent={DateRangeFilter.Preview}
      choiceComponent={ChoiceFilter.Preview}
      // getTotal={getTotal}
      getOptions={getOptions}
    />
  );
}
