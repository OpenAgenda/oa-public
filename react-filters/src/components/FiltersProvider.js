import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { Form, FormSpy } from 'react-final-form';
import ApiClient from '@openagenda/react-shared/lib/utils/apiClient';
import mergeLocales from '@openagenda/react-shared/lib/utils/mergeLocales';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import ApiClientContext from '@openagenda/react-shared/lib/contexts/ApiClientContext';
import { createForm } from 'final-form';
import { IntlProvider, RawIntlProvider, useIntl } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import appLocales from '../locales';
import filtersToAggregations from '../utils/filtersToAggregations';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext';
import { withDefaultFilterConfig } from '../utils';

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

const FiltersForm = React.forwardRef(({ onSubmit, initialValues, subscription, children }, ref) => {
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
  apiClient: customApiClient,
  initialValues,
  onSubmit,
  subscription,
  children,
}, ref) => {
  const intl = useIntl();
  const apiClientInstance = useConstant(() => customApiClient || ApiClient());

  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  const filtersOptions = useMemo(
    () => ({ missingValue, mapTiles }),
    [missingValue, mapTiles]
  );
  const [filters, setFilters] = useState(() => rawFilters.map(rawFilter => (
    withDefaultFilterConfig(rawFilter, intl, filtersOptions)
  )));
  const [widgets, setWidgets] = useState(() => rawWidgets);

  const updateFilters = useCallback(newFilters => {
    setFilters(newFilters.map(rawFilter => (
      withDefaultFilterConfig(rawFilter, intl, filtersOptions)
    )));
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
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ApiClientContext.Provider>
  );
});

function FiltersProvider(
  {
    children,
    intl,
    locale = 'en',
    locales: userLocales,
    filters,
    widgets,
    // filters config
    missingValue,
    mapTiles,
    // for test
    apiClient,
    // form config
    onSubmit,
    initialValues,
    subscription = defaultSubscription,
  },
  ref
) {
  const locales = useMemo(
    () => mergeLocales(appLocales, userLocales || {}),
    [userLocales]
  );

  const child = (
    <IntlProvided
      ref={ref}
      filters={filters}
      widgets={widgets}
      missingValue={missingValue}
      mapTiles={mapTiles}
      apiClient={apiClient}
      onSubmit={onSubmit}
      initialValues={initialValues}
      subscription={subscription}
    >
      {children}
    </IntlProvided>
  );

  if (intl) {
    return <RawIntlProvider value={intl}>{child}</RawIntlProvider>;
  }

  return (
    <IntlProvider messages={locales[locale]} locale={locale} key={locale}>
      {child}
    </IntlProvider>
  );
}

export default React.forwardRef(FiltersProvider);
