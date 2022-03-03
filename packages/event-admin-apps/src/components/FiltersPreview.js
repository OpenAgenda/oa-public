import React, { useMemo } from 'react';
import { ActiveFilters } from '@openagenda/react-filters';

export default function FiltersPreview({ filters, getOptions, disabled }) {
  const filtersWithSearch = useMemo(
    () => [{ type: 'search', name: 'search' }, ...filters],
    [filters]
  );

  return (
    <ActiveFilters
      filters={filtersWithSearch}
      disabled={disabled}
      getOptions={getOptions}
    />
  );
}
