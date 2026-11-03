import { useContext, useEffect, useRef } from 'react';
import { Form } from 'react-final-form';
import { createForm } from 'final-form';
import isEqual from 'lodash/isEqual.js';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';
import useActiveFilters from '../hooks/useActiveFilters.js';
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

const noSubscription = {};

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

// With manual submit the active filters describe the list, not the pending
// selection: they render in a form of their own that holds the applied values,
// and a value removed there is applied at once.
function AppliedActiveFilters({ applied, ...rest }) {
  const { values, apply } = applied;
  const appliedRef = useRef(values);
  appliedRef.current = values;
  const applyRef = useRef(apply);
  applyRef.current = apply;

  const appliedForm = useConstant(() =>
    createForm({ onSubmit: () => {}, initialValues: values }));

  useEffect(() => {
    if (!isEqual(appliedForm.getState().values, values)) {
      appliedForm.initialize(values);
    }
  }, [appliedForm, values]);

  useEffect(
    () =>
      appliedForm.subscribe(
        ({ values: next }) => {
          if (!isEqual(next, appliedRef.current)) {
            applyRef.current(next);
          }
        },
        { values: true },
      ),
    [appliedForm],
  );

  return (
    <Form form={appliedForm} subscription={noSubscription}>
      {() => <ActiveFiltersList {...rest} />}
    </Form>
  );
}

export default function ActiveFilters(props) {
  const applied = useContext(AppliedValuesContext);

  return applied ? (
    <AppliedActiveFilters applied={applied} {...props} />
  ) : (
    <ActiveFiltersList {...props} />
  );
}
