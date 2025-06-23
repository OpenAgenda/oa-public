import {
  FiltersAndWidgetsContext_default
} from "./chunk-KG7QE6MN.js";
import {
  withDefaultFilterConfig
} from "./chunk-3EOZOFPD.js";
import {
  filtersToAggregations
} from "./chunk-TWJ2L7HC.js";

// src/components/FiltersProvider.js
import React, {
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
  useRef
} from "react";
import { Form, FormSpy } from "react-final-form";
import useConstant from "@openagenda/react-shared/dist/hooks/useConstant.js";
import { createForm } from "final-form";
import { RawIntlProvider, useIntl } from "react-intl";
import { Fragment, jsx, jsxs } from "@emotion/react/jsx-runtime";
var defaultSubscription = {};
var spySubscription = { dirty: true, values: true };
var FiltersForm = React.forwardRef(
  ({ onSubmit, initialValues, manualSubmit, subscription, children }, ref) => {
    const { filters } = useContext(FiltersAndWidgetsContext_default);
    const submittedValuesRef = useRef();
    const handleSubmit = useCallback(
      (values, form2) => {
        const aggregations = filtersToAggregations(filters);
        submittedValuesRef.current = values;
        return onSubmit(values, aggregations, form2);
      },
      [filters, onSubmit]
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
          return;
        }
        if (dirty) {
          form.submit();
          form.reset(values);
        }
      },
      [form, manualSubmit]
    );
    return /* @__PURE__ */ jsx(Form, { form, subscription, children: () => /* @__PURE__ */ jsxs(Fragment, { children: [
      children,
      /* @__PURE__ */ jsx(FormSpy, { subscription: spySubscription, onChange: onValueChange })
    ] }) });
  }
);
var IntlProvided = React.forwardRef(
  ({
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
    res,
    children
  }, ref) => {
    const intl = useIntl();
    const filtersOptions = useMemo(
      () => ({
        missingValue,
        mapTiles,
        dateFnsLocale,
        manualSubmit,
        searchMethod,
        res
      }),
      [missingValue, mapTiles, dateFnsLocale, manualSubmit, searchMethod, res]
    );
    const [filters, setFilters] = useState(() => (rawFilters ?? []).map((rawFilter) => withDefaultFilterConfig(rawFilter, intl, filtersOptions)));
    const [widgets, setWidgets] = useState(() => rawWidgets);
    const updateFilters = useCallback(
      (newFilters) => {
        setFilters(
          newFilters.map((rawFilter) => withDefaultFilterConfig(rawFilter, intl, filtersOptions))
        );
      },
      [filtersOptions, intl]
    );
    const filtersAndWidgets = useMemo(
      () => ({
        filters,
        widgets,
        setFilters: updateFilters,
        setWidgets,
        filtersOptions
      }),
      [filters, updateFilters, widgets, filtersOptions]
    );
    return /* @__PURE__ */ jsx(FiltersAndWidgetsContext_default.Provider, { value: filtersAndWidgets, children: /* @__PURE__ */ jsx(
      FiltersForm,
      {
        ref,
        onSubmit,
        initialValues,
        subscription,
        searchMethod,
        manualSubmit,
        children
      }
    ) });
  }
);
function FiltersProvider({
  children = void 0,
  intl = null,
  filters = null,
  widgets = [],
  // filters config
  missingValue = null,
  mapTiles = null,
  dateFnsLocale = void 0,
  // for test
  apiClient = null,
  // form config
  onSubmit = null,
  initialValues = null,
  subscription = defaultSubscription,
  searchMethod = "get",
  manualSubmit = false,
  // to load on-demand aggregations (geo, timings)
  res = null
}, ref) {
  const child = /* @__PURE__ */ jsx(
    IntlProvided,
    {
      ref,
      filters,
      widgets,
      missingValue,
      mapTiles,
      dateFnsLocale,
      apiClient,
      onSubmit,
      initialValues,
      subscription,
      searchMethod,
      manualSubmit,
      res,
      children
    }
  );
  if (intl) {
    return /* @__PURE__ */ jsx(RawIntlProvider, { value: intl, children: child });
  }
  return child;
}
var FiltersProvider_default = React.forwardRef(FiltersProvider);

export {
  FiltersProvider_default
};
//# sourceMappingURL=chunk-JT55NOMO.js.map