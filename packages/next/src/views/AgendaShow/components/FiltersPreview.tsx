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
import { Wrap } from '@openagenda/uikit';
import FilterPreviewer from './FilterPreviewer';
import { FavoritesPreviewer } from './FavoritesFilter';

export default function FiltersPreview({ agenda, filters, getOptions, disabled }) {
  const completedFilters = useMemo(
    () => [
      { type: 'search', name: 'search' },
      { type: 'favorites', name: 'favorites' },
      ...filters,
    ],
    [filters],
  );

  const activeFilters = useActiveFilters(completedFilters);

  if (!activeFilters.length) {
    return null;
  }

  return (
    <Wrap>
      <Filters
        filters={activeFilters}
        disabled={disabled}
        getOptions={getOptions}
        agendaUid={agenda.uid}
        choiceComponent={(ChoiceFilter as any).Preview}
        dateRangeComponent={(DateRangeFilter as any).Preview}
        definedRangeComponent={(DefinedRangeFilter as any).Preview}
        searchComponent={(SearchFilter as any).Preview}
        mapComponent={(MapFilter as any).Preview}
        customComponent={(CustomFilter as any).Preview}
        favoritesComponent={FavoritesPreviewer as any}
        component={FilterPreviewer}
      />
    </Wrap>
  );
}
