import { useMemo } from 'react';
import {
  Filters,
  useActiveFilters,
  ChoiceFilter,
  DateRangeFilter,
  DefinedRangeFilter,
  SearchFilter,
  MapFilter,
  CustomFilter,
} from '@openagenda/react-filters';
import { HStack } from '@openagenda/uikit';
import FilterPreviewer from './FilterPreviewer';

export default function FiltersPreview({ filters, getOptions, disabled }) {
  const filtersWithSearch = useMemo(
    () => [{ type: 'search', name: 'search' }, ...filters],
    [filters],
  );

  const activeFilters = useActiveFilters(filtersWithSearch);

  if (!activeFilters.length) {
    return null;
  }

  return (
    <HStack mt="8">
      <Filters
        filters={activeFilters}
        disabled={disabled}
        getOptions={getOptions}
        choiceComponent={(ChoiceFilter as any).Preview}
        dateRangeComponent={(DateRangeFilter as any).Preview}
        definedRangeComponent={(DefinedRangeFilter as any).Preview}
        searchComponent={(SearchFilter as any).Preview}
        mapComponent={(MapFilter as any).Preview}
        customComponent={(CustomFilter as any).Preview}
        // favoritesComponent={FavoritesFilter.Preview}
        component={FilterPreviewer}
      />
    </HStack>
  );
}
