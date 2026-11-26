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

// what a submit sends: final-form drops a cleared field's key
function withoutUndefined(values) {
  return omitBy(values, (v) => v === undefined);
}

function changedNames(a, b) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (name) => !sameValues(a[name], b[name]),
  );
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
    // the same, as state, for what renders the applied values; manual submit
    // only, where they can differ from the form's
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

    // Relevance only ranks against a search: it is never applied without
    // one, the order applied before it comes back. Kept here with the
    // applied values, whether a Sort is mounted or not. Manual submit only:
    // in automatic mode Sort settles the form itself before each submit.
    const sortBeforeRelevanceRef = useRef(
      initialValues?.sort === 'score' ? undefined : initialValues?.sort,
    );
    const applyRules = useConstant(() => (values) => {
      const ruled = !values.search && values.sort === 'score'
        ? { ...values, sort: sortBeforeRelevanceRef.current }
        : values;

      if (ruled.sort !== 'score') {
        sortBeforeRelevanceRef.current = ruled.sort;
      }

      return withoutUndefined(ruled);
    });

    // Set while the provider realigns the form on the applied values: the
    // pending state and the fields' own reactions wait for it to end.
    const applyingRef = useRef(false);
    const formRef = useRef();
    const realign = useConstant(() => (values, names) => {
      applyingRef.current = true;
      try {
        formRef.current.batch(() => {
          names.forEach((name) => formRef.current.change(name, values[name]));
        });
      } finally {
        applyingRef.current = false;
      }
    });

    const handleSubmit = useCallback(
      (submitted, form) => {
        const aggregations = filtersToAggregations(filters);
        let values = submitted;

        if (manualSubmit) {
          values = applyRules(submitted);
          realign(values, changedNames(submitted, values));
          setAppliedValues(values);
        }

        submittedValuesRef.current = values;
        setPending(false, values);

        return onSubmit(values, aggregations, form);
      },
      [applyRules, filters, manualSubmit, onSubmit, realign, setPending],
    );

    // the form is created once: its submits go through the latest handler,
    // as `apply` does
    const handleSubmitRef = useRef(handleSubmit);
    handleSubmitRef.current = handleSubmit;

    // Set while the form is reset to other values (back/forward, a link, a
    // reset the page makes): Sort leaves the sort they come with alone.
    // A count, as final-form's reset calls initialize.
    const resettingRef = useRef(0);

    const form = useConstant(() => {
      const finalForm = createForm({
        onSubmit: (...args) => handleSubmitRef.current(...args),
        initialValues,
      });
      finalForm.getSubmittedValues = () => submittedValuesRef.current;

      ['reset', 'initialize', 'restart'].forEach((method) => {
        const original = finalForm[method];
        finalForm[method] = (...args) => {
          resettingRef.current += 1;
          try {
            return original(...args);
          } finally {
            resettingRef.current -= 1;
          }
        };
      });
      finalForm.isResetting = () => resettingRef.current > 0;

      return finalForm;
    });
    formRef.current = form;

    useImperativeHandle(ref, () => form);

    const getApplied = useConstant(
      () => () =>
        submittedValuesRef.current
        ?? formRef.current.getState().initialValues
        ?? {},
    );

    // Applies `requested` as it is, whatever the form holds: the active
    // filters remove a value from the list without applying the visitor's
    // pending changes on other filters. Each filter whose applied value
    // changes, by the request or by a rule, realigns on it, its own pending
    // changes dropped.
    const apply = useCallback(
      (requested) => {
        const previous = getApplied();
        const values = applyRules(requested);

        submittedValuesRef.current = values;
        setAppliedValues(values);
        realign(values, changedNames(previous, values));

        const { values: current } = form.getState();
        setPending(
          !sameValues(withoutEmpty(current), withoutEmpty(values)),
          current,
        );

        return onSubmit(values, filtersToAggregations(filters), form);
      },
      [applyRules, filters, form, getApplied, onSubmit, realign, setPending],
    );

    const appliedContext = useMemo(
      () =>
        (manualSubmit
          ? {
            values: appliedValues,
            apply,
            sortBeforeRelevance: () => sortBeforeRelevanceRef.current,
            isApplying: () => applyingRef.current,
          }
          : null),
      [manualSubmit, appliedValues, apply],
    );

    const onValueChange = useCallback(
      ({ dirty, values }) => {
        if (manualSubmit) {
          // a realignment settles the pending state itself, once it is done
          if (applyingRef.current) {
            return;
          }

          setPending(
            !sameValues(withoutEmpty(values), withoutEmpty(getApplied())),
            values,
          );
          return;
        }
        if (dirty) {
          form.submit();
          form.reset(values);
        }
      },
      [form, getApplied, manualSubmit, setPending],
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
