import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Form, FormSpy } from 'react-final-form';
import ApiClient from '@openagenda/react-shared/lib/utils/apiClient';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import ApiClientContext from '@openagenda/react-shared/lib/contexts/ApiClientContext';
import { createForm } from 'final-form';
import { RawIntlProvider, useIntl } from 'react-intl';
import filtersToAggregations from '../utils/filtersToAggregations';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext';
import { withDefaultFilterConfig } from '../utils';

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

const FiltersForm = React.forwardRef(({
  onSubmit,
  initialValues,
  subscription,
  children,
}, ref) => {
  const { filters } = useContext(FiltersAndWidgetsContext);

  const handleSubmit = useCallback((values, form) => {
    const aggregations = filtersToAggregations(filters);

    return onSubmit(values, aggregations, form);
  }, [filters, onSubmit]);

  const form = useConstant(() => createForm({ onSubmit: handleSubmit, initialValues }));

  useImperativeHandle(ref, () => form);

  const onValueChange = useCallback(({ dirty, values }) => {
    if (dirty) {
      form.submit();
      form.reset(values);
    }
  }, [form]);

  return (
    <Form form={form} subscription={subscription}>
      {() => (
        <>
          {children}

          <FormSpy
            subscription={spySubscription}
            onChange={onValueChange}
          />
        </>
      )}
    </Form>
  );
});

const IntlProvided = React.forwardRef(({
  filters: rawFilters,
  widgets: rawWidgets,
  missingValue,
  mapTiles,
  dateFnsLocale,
  apiClient: customApiClient,
  initialValues,
  onSubmit,
  subscription,
  children,
}, ref) => {
  const intl = useIntl();
  const apiClientInstance = useConstant(() => customApiClient || ApiClient());

  const filtersOptions = useMemo(
    () => ({ missingValue, mapTiles, dateFnsLocale }),
    [missingValue, mapTiles, dateFnsLocale],
  );
  const [filters, setFilters] = useState(() => (rawFilters ?? []).map(rawFilter => withDefaultFilterConfig(
    rawFilter,
    intl,
    filtersOptions,
  )));
  const [widgets, setWidgets] = useState(() => rawWidgets);

  const updateFilters = useCallback(newFilters => {
    setFilters(newFilters.map(rawFilter =>
      withDefaultFilterConfig(rawFilter, intl, filtersOptions)));
  }, [intl, mapTiles, missingValue]);

  const filtersAndWidgets = useMemo(() => ({
    filters,
    widgets,
    setFilters: updateFilters,
    setWidgets,
    filtersOptions,
  }), [filters, updateFilters, widgets, filtersOptions]);

  return (
    <ApiClientContext.Provider value={apiClientInstance}>
      <FiltersAndWidgetsContext.Provider value={filtersAndWidgets}>
        <FiltersForm
          ref={ref}
          onSubmit={onSubmit}
          initialValues={initialValues}
          subscription={subscription}
        >
          {children}
        </FiltersForm>
      </FiltersAndWidgetsContext.Provider>
    </ApiClientContext.Provider>
  );
});

function FiltersProvider(
  {
    children,
    intl,
    filters,
    widgets = [],
    // filters config
    missingValue = null,
    mapTiles = null,
    dateFnsLocale,
    // for test
    apiClient = null,
    // form config
    onSubmit,
    initialValues,
    subscription = defaultSubscription,
  },
  ref,
) {
  const child = (
    <IntlProvided
      ref={ref}
      filters={filters}
      widgets={widgets}
      missingValue={missingValue}
      mapTiles={mapTiles}
      dateFnsLocale={dateFnsLocale}
      apiClient={apiClient}
      onSubmit={onSubmit}
      initialValues={initialValues}
      subscription={subscription}
    >
      {children}
    </IntlProvided>
  );

  if (intl) {
    return (
      <RawIntlProvider value={intl}>
        {child}
      </RawIntlProvider>
    );
  }

  return child;
}

export default React.forwardRef(FiltersProvider);
