import useActiveFilters from '../hooks/useActiveFilters';
import Filters from './Filters';
import DateRangeFilter from './filters/DateRangeFilter';
import NumberRangeFilter from './filters/NumberRangeFilter';
import ChoiceFilter from './filters/ChoiceFilter';
import DefinedRangeFilter from './filters/DefinedRangeFilter';
import SearchFilter from './filters/SearchFilter';
import MapFilter from './filters/MapFilter';
import CustomFilter from './filters/CustomFilter';
import FavoritesFilter from './filters/FavoritesFilter';

export default function ActiveFilters({
  filters,
  ...rest
}) {
  const activeFilters = useActiveFilters(filters);

  return (
    <Filters
      filters={activeFilters}
      choiceComponent={ChoiceFilter.Preview}
      dateRangeComponent={DateRangeFilter.Preview}
      numberRangeComponent={NumberRangeFilter.Preview}
      definedRangeComponent={DefinedRangeFilter.Preview}
      searchComponent={SearchFilter.Preview}
      mapComponent={MapFilter.Preview}
      customComponent={CustomFilter.Preview}
      favoritesComponent={FavoritesFilter.Preview}
      {...rest}
    />
  );
}
