import useActiveFilters from '../hooks/useActiveFilters.js';
import Filters from './Filters.js';
import DateRangeFilter from './filters/DateRangeFilter.js';
import SimpleDateRangeFilter from './filters/SimpleDateRangeFilter.js';
import NumberRangeFilter from './filters/NumberRangeFilter.js';
import ChoiceFilter from './filters/ChoiceFilter.js';
import DefinedRangeFilter from './filters/DefinedRangeFilter.js';
import SearchFilter from './filters/SearchFilter.js';
import MapFilter from './filters/MapFilter.js';
import CustomFilter from './filters/CustomFilter.js';
import FavoritesFilter from './filters/FavoritesFilter.js';
import TimelineFilter from './filters/TimelineFilter.js';

export default function ActiveFilters({ filters, ...rest }) {
  const activeFilters = useActiveFilters(filters);

  return (
    <Filters
      filters={activeFilters}
      choiceComponent={ChoiceFilter.Preview}
      dateRangeComponent={DateRangeFilter.Preview}
      simpleDateRangeComponent={SimpleDateRangeFilter.Preview}
      numberRangeComponent={NumberRangeFilter.Preview}
      definedRangeComponent={DefinedRangeFilter.Preview}
      searchComponent={SearchFilter.Preview}
      mapComponent={MapFilter.Preview}
      customComponent={CustomFilter.Preview}
      favoritesComponent={FavoritesFilter.Preview}
      timelineComponent={TimelineFilter.Preview}
      {...rest}
    />
  );
}
