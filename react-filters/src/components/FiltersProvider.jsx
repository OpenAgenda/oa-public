import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from 'react';
import isEqual from 'lodash/isEqual.js';
import { Form, FormSpy } from 'react-final-form';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import { createForm } from 'final-form';
import { RawIntlProvider, useIntl } from 'react-intl';
import filtersToAggregations from '../utils/filtersToAggregations.js';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext.js';
import { withDefaultFilterConfig } from '../utils/index.js';

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

const FiltersForm = React.forwardRef(
  (
    {
      onSubmit,
      onPendingChange,
      initialValues,
      manualSubmit,
      subscription,
      children,
    },
    ref,
  ) => {
    const { filters } = useContext(FiltersAndWidgetsContext);

    const submittedValuesRef = useRef();

    // Pending: the form holds values that have not been submitted yet. Only
    // manual submit can get there, automatic mode submits every change.
    const pendingRef = useRef(false);
    const onPendingChangeRef = useRef(onPendingChange);
    onPendingChangeRef.current = onPendingChange;

    const setPending = useConstant(() => (pending, values) => {
      if (pending === pendingRef.current) {
        return;
      }
      pendingRef.current = pending;
      onPendingChangeRef.current?.(pending, values);
    });

    const handleSubmit = useCallback(
      (values, form) => {
        const aggregations = filtersToAggregations(filters);

        submittedValuesRef.current = values;
        setPending(false, values);

        return onSubmit(values, aggregations, form);
      },
      [filters, onSubmit, setPending],
    );

    const form = useConstant(() => {
      const finalForm = createForm({ onSubmit: handleSubmit, initialValues });
      finalForm.getSubmittedValues = () => submittedValuesRef.current;
      return finalForm;
    });

    useImperativeHandle(ref, () => form);

    const onValueChange = useCallback(
      ({ dirty, values }) => {
        if (manualSubmit) {
          const applied = submittedValuesRef.current ?? form.getState().initialValues ?? {};

          setPending(!isEqual(values, applied), values);
          return;
        }
        if (dirty) {
          form.submit();
          form.reset(values);
        }
      },
      [form, manualSubmit, setPending],
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
      onPendingChange,
      subscription,
      searchMethod,
      manualSubmit,
      res,
      children,
    },
    ref,
  ) => {
    const intl = useIntl();

    const filtersOptions = useMemo(
      () => ({
        missingValue,
        mapTiles,
        dateFnsLocale,
        manualSubmit,
        searchMethod,
        res,
      }),
      [missingValue, mapTiles, dateFnsLocale, manualSubmit, searchMethod, res],
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
          onPendingChange={onPendingChange}
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
    // form config
    onSubmit = null,
    onPendingChange = null,
    initialValues = null,
    subscription = defaultSubscription,
    searchMethod = 'get',
    manualSubmit = false,
    // to load on-demand aggregations (geo, timings)
    res = null,
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
      onSubmit={onSubmit}
      onPendingChange={onPendingChange}
      initialValues={initialValues}
      subscription={subscription}
      searchMethod={searchMethod}
      manualSubmit={manualSubmit}
      res={res}
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
