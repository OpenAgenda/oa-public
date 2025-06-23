import {
  FiltersManager_default
} from "./chunk-56FW7AMQ.js";
import {
  FiltersProvider_default
} from "./chunk-JT55NOMO.js";
import {
  IntlProvider
} from "./chunk-RYZXNMCP.js";
import {
  extractFiltersFromDom
} from "./chunk-2RSB3QXO.js";
import {
  extractWidgetsFromDom
} from "./chunk-LQ3IHF25.js";

// src/render.js
import omit from "lodash/omit.js";
import React from "react";
import ReactDOM from "react-dom/client";
import qs from "qs";
import * as dateFnsLocales from "date-fns/locale/index.js";
import { prepareClientPortals } from "@openagenda/react-portal-ssr";
import { jsx } from "@emotion/react/jsx-runtime";
function createContainer() {
  const container = document.createElement("div");
  container.setAttribute("data-oa-filters-root", "");
  return container;
}
function defaultFilterChange(values, aggregations, ref, form) {
  console.log("Filters changed, but there is no onFilterChange !");
  console.log(values, aggregations, ref, form);
}
function renderFiltersAndWidgets({
  ref = React.createRef(),
  res = "/events",
  locale = "en",
  locales: userLocales,
  aggregations,
  total,
  query,
  defaultViewport,
  onFilterChange = defaultFilterChange,
  missingValue = "null",
  onLoad,
  filtersBase,
  apiClient,
  manualSubmit,
  ...rest
} = {}) {
  const container = createContainer();
  document.body.appendChild(container);
  const filters = extractFiltersFromDom();
  const widgets = extractWidgetsFromDom();
  prepareClientPortals();
  const initialValues = typeof query === "string" ? qs.parse(query, { ignoreQueryPrefix: true }) : query;
  function bindRef() {
    return Object.keys(ref.current).reduce(
      (accu, key) => ({
        ...accu,
        [key]: (...args) => ref.current[key](...args)
      }),
      {}
    );
  }
  function wrapCallback(fn) {
    if (typeof fn !== "function") {
      return fn;
    }
    return (values, aggs, form) => fn(values, aggs, bindRef(), form);
  }
  const root = ReactDOM.createRoot(container);
  root.render(
    /* @__PURE__ */ jsx(IntlProvider, { locale, userLocales, children: /* @__PURE__ */ jsx(
      FiltersProvider_default,
      {
        filters,
        widgets,
        onSubmit: wrapCallback(onFilterChange),
        initialValues: omit(initialValues, "sort"),
        apiClient,
        res,
        dateFnsLocale: dateFnsLocales[locale],
        missingValue,
        manualSubmit,
        children: /* @__PURE__ */ jsx(
          FiltersManager_default,
          {
            ref,
            aggregations,
            total,
            query: initialValues,
            defaultViewport,
            filtersBase,
            onLoad: wrapCallback(onLoad),
            ...rest
          }
        )
      }
    ) })
  );
}

export {
  renderFiltersAndWidgets
};
//# sourceMappingURL=chunk-E2Y2C6VG.js.map