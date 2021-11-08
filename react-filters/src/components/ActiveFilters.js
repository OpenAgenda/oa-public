import _ from 'lodash';
import React, { useMemo } from 'react';
import { useFormState } from 'react-final-form';
import Filters from './Filters';
import DateRangeFilter, { formatValue as formatDateRangeValue } from './filters/DateRangeFilter';
import ChoiceFilter from './filters/ChoiceFilter';
import DefinedRangeFilter from './filters/DefinedRangeFilter';
import SearchFilter from './filters/SearchFilter';
import MapFilter from './filters/MapFilter';
import CustomFilter from './filters/CustomFilter';

function matchQuery(a, b) {
  return _.isMatch(_.omitBy(a, _.isEmpty), _.omitBy(b, _.isEmpty));
}

function staticRangesFirst(a, b) {
  if (a.staticRanges && !b.staticRanges) {
    return -1;
  }
  if (!a.staticRanges && b.staticRanges) {
    return 1;
  }

  return 0;
}

function customFirst(a, b) {
  if (a.type === 'custom' && b.type !== 'custom') {
    return -1;
  }
  if (a.type !== 'custom' && b.type === 'custom') {
    return 1;
  }

  return 0;
}

function matchFilter(filter, values, entry) {
  const [key, value] = entry;

  // Matching custom
  if (filter.type === 'custom' && filter.activeFilterLabel) {
    return key in filter.query && matchQuery(values, filter.query);
  }

  // Matching staticRanges
  if (filter.type === 'definedRange' && filter.name === key) {
    const formattedValue = formatDateRangeValue(value)[0];
    return !!filter.staticRanges.find(v => v.isSelected(formattedValue));
  }

  // Same name
  return filter.name === key;
}

export default function ActiveFilters({
  filters,
  ...rest
}) {
  const { values } = useFormState({ subscription: { values: true } });

  const sortedFilters = useMemo(() => filters
    .map(({ destSelector, destContainer, ...filter }) => filter)
    .sort(staticRangesFirst)
    .sort(customFirst), [filters]);

  const activeFilters = useMemo(() => Object.entries(values)
    .reduce((accu, entry) => {
      const matchingFilter = sortedFilters.find(filter => matchFilter(filter, values, entry));

      if (matchingFilter && !accu.includes(matchingFilter)) {
        accu.push(matchingFilter);
      }

      return accu;
    }, []), [sortedFilters, values]);

  return (
    <Filters
      filters={activeFilters}
      choiceComponent={ChoiceFilter.Preview}
      dateRangeComponent={DateRangeFilter.Preview}
      definedRangeComponent={DefinedRangeFilter.Preview}
      searchComponent={SearchFilter.Preview}
      mapComponent={MapFilter.Preview}
      customComponent={CustomFilter.Preview}
      {...rest}
    />
  );
}
