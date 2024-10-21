import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Form, FormSpy } from 'react-final-form';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import { createForm } from 'final-form';
import { RawIntlProvider, useIntl } from 'react-intl';
import filtersToAggregations from '../utils/filtersToAggregations';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext';
import { withDefaultFilterConfig } from '../utils';

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

const FiltersForm = React.forwardRef(
  ({ onSubmit, initialValues, manualSubmit, subscription, children }, ref) => {
    const { filters } = useContext(FiltersAndWidgetsContext);

    const handleSubmit = useCallback(
      (values, form) => {
        const aggregations = filtersToAggregations(filters);

        return onSubmit(values, aggregations, form);
      },
      [filters, onSubmit],
    );

    const form = useConstant(() =>
      createForm({ onSubmit: handleSubmit, initialValues }));

    useImperativeHandle(ref, () => form);

    const onValueChange = useCallback(
      ({ dirty, values }) => {
        if (manualSubmit) {
          return;
        }
        if (dirty) {
          form.submit();
          form.reset(values);
        }
      },
      [form, manualSubmit],
    );

    return (
      <Form form={form} subscription={subscription}>
        {() => (
          <>
            {children}

            <FormSpy subscription={spySubscription} onChange={onValueChange} />
          </>
        )}
      </Form>
    );
  },
);

const IntlProvided = React.forwardRef(
  (
    {
      filters: rawFilters,
      widgets: rawWidgets,
      missingValue,
      mapTiles,
      dateFnsLocale,
      initialValues,
      onSubmit,
      subscription,
      searchMethod,
      manualSubmit,
      children,
    },
    ref,
  ) => {
    const intl = useIntl();

    const filtersOptions = useMemo(
      () => ({ missingValue, mapTiles, dateFnsLocale }),
      [missingValue, mapTiles, dateFnsLocale],
    );
    const [filters, setFilters] = useState(() =>
      (rawFilters ?? []).map((rawFilter) =>
        withDefaultFilterConfig(rawFilter, intl, filtersOptions)));
    const [widgets, setWidgets] = useState(() => rawWidgets);

    const updateFilters = useCallback(
      (newFilters) => {
        setFilters(
          newFilters.map((rawFilter) =>
            withDefaultFilterConfig(rawFilter, intl, filtersOptions)),
        );
      },
      [filtersOptions, intl],
    );

    const filtersAndWidgets = useMemo(
      () => ({
        filters,
        widgets,
        setFilters: updateFilters,
        setWidgets,
        filtersOptions,
      }),
      [filters, updateFilters, widgets, filtersOptions],
    );

    return (
      <FiltersAndWidgetsContext.Provider value={filtersAndWidgets}>
        <FiltersForm
          ref={ref}
          onSubmit={onSubmit}
          initialValues={initialValues}
          subscription={subscription}
          searchMethod={searchMethod}
          manualSubmit={manualSubmit}
        >
          {children}
        </FiltersForm>
      </FiltersAndWidgetsContext.Provider>
    );
  },
);

function FiltersProvider(
  {
    children = undefined,
    intl = null,
    filters = null,
    widgets = [],
    // filters config
    missingValue = null,
    mapTiles = null,
    dateFnsLocale = undefined,
    // for test
    apiClient = null,
    // form config
    onSubmit = null,
    initialValues = null,
    subscription = defaultSubscription,
    searchMethod = 'get',
    manualSubmit = false,
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
      searchMethod={searchMethod}
      manualSubmit={manualSubmit}
    >
      {children}
    </IntlProvided>
  );

  if (intl) {
    return <RawIntlProvider value={intl}>{child}</RawIntlProvider>;
  }

  return child;
}

export default React.forwardRef(FiltersProvider);
