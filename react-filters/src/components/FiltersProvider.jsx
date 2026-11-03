import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from 'react';
import isEqualWith from 'lodash/isEqualWith.js';
import omitBy from 'lodash/omitBy.js';
import { Form, FormSpy } from 'react-final-form';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import { createForm } from 'final-form';
import { RawIntlProvider, useIntl } from 'react-intl';
import filtersToAggregations from '../utils/filtersToAggregations.js';
import FiltersAndWidgetsContext from '../contexts/FiltersAndWidgetsContext.js';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';
import { withDefaultFilterConfig } from '../utils/index.js';

const defaultSubscription = {};

const byJSON = (a, b) => {
  const [ja, jb] = [JSON.stringify(a), JSON.stringify(b)];
  if (ja === jb) {
    return 0;
  }
  return ja < jb ? -1 : 1;
};

// A multiple choice keeps its values in click order: unticking an option and
// ticking it again moves it to the end, the selection stays the same.
function sameValues(a, b) {
  return isEqualWith(a, b, (x, y) => {
    if (!Array.isArray(x) || !Array.isArray(y)) {
      return undefined;
    }
    if (x.length !== y.length) {
      return false;
    }
    const sortedY = [...y].sort(byJSON);
    return [...x].sort(byJSON).every((v, i) => sameValues(v, sortedY[i]));
  });
}

// A cleared text field holds undefined, its initial value can be ''
function withoutEmpty(values) {
  return omitBy(values, (v) => v === undefined || v === '');
}

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
    // the same, as state, for what renders the applied values
    const [appliedValues, setAppliedValues] = useState(
      () => initialValues ?? {},
    );

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
        setAppliedValues(values);
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

    // Applies `values` as they are, whatever the form holds: the active
    // filters remove a value from the list without applying the visitor's
    // pending changes on other filters. The filter the change is on takes the
    // applied value, its own pending changes dropped.
    const apply = useCallback(
      (values) => {
        const previous = submittedValuesRef.current ?? form.getState().initialValues ?? {};

        submittedValuesRef.current = values;
        setAppliedValues(values);

        form.batch(() => {
          const names = new Set([
            ...Object.keys(previous),
            ...Object.keys(values),
          ]);

          names.forEach((name) => {
            if (!sameValues(previous[name], values[name])) {
              form.change(name, values[name]);
            }
          });
        });

        const { values: current } = form.getState();
        setPending(
          !sameValues(withoutEmpty(current), withoutEmpty(values)),
          current,
        );

        return onSubmit(values, filtersToAggregations(filters), form);
      },
      [filters, form, onSubmit, setPending],
    );

    const appliedContext = useMemo(
      () => (manualSubmit ? { values: appliedValues, apply } : null),
      [manualSubmit, appliedValues, apply],
    );

    const onValueChange = useCallback(
      ({ dirty, values }) => {
        if (manualSubmit) {
          const applied = submittedValuesRef.current ?? form.getState().initialValues ?? {};

          setPending(
            !sameValues(withoutEmpty(values), withoutEmpty(applied)),
            values,
          );
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
      <AppliedValuesContext.Provider value={appliedContext}>
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
      </AppliedValuesContext.Provider>
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
