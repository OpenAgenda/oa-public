import useActiveFilters from '../hooks/useActiveFilters.js';
import AppliedValuesForm from './AppliedValuesForm.jsx';
import Filters from './Filters.jsx';
import DateRangeFilter from './filters/DateRangeFilter.jsx';
import SimpleDateRangeFilter from './filters/SimpleDateRangeFilter.jsx';
import NumberRangeFilter from './filters/NumberRangeFilter.jsx';
import ChoiceFilter from './filters/ChoiceFilter.jsx';
import DefinedRangeFilter from './filters/DefinedRangeFilter.jsx';
import SearchFilter from './filters/SearchFilter.jsx';
import MapFilter from './filters/MapFilter.jsx';
import CustomFilter from './filters/CustomFilter.jsx';
import FavoritesFilter from './filters/FavoritesFilter.jsx';
import TimelineFilter from './filters/TimelineFilter.jsx';

function ActiveFiltersList({ filters, ...rest }) {
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

// the active filters describe the list: with manual submit, the applied
// values, not the pending selection
export default function ActiveFilters(props) {
  return (
    <AppliedValuesForm>
      <ActiveFiltersList {...props} />
    </AppliedValuesForm>
  );
}
