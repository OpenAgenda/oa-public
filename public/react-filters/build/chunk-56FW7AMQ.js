import {
  Total
} from "./chunk-UPWQXRFP.js";
import {
  getEvents
} from "./chunk-M6FAEUC6.js";
import {
  ActiveFilters
} from "./chunk-OXSXNVHF.js";
import {
  MapFilter_default
} from "./chunk-VZF2MR7D.js";
import {
  NumberRangeFilter_default
} from "./chunk-444AZKQJ.js";
import {
  SearchFilter_default
} from "./chunk-2MRLBDJH.js";
import {
  SimpleDateRangeFilter_default
} from "./chunk-RF4NYU22.js";
import {
  TimelineFilter_default
} from "./chunk-7UDPHN3H.js";
import {
  ChoiceFilter_default
} from "./chunk-SA3WJCAL.js";
import {
  CustomFilter_default
} from "./chunk-FC4CRMEK.js";
import {
  DefinedRangeFilter_default
} from "./chunk-SFQSTNHB.js";
import {
  FavoritesFilter_default
} from "./chunk-7D7BIYPT.js";
import {
  Filters_default
} from "./chunk-ZE7LKT33.js";
import {
  FavoriteToggle
} from "./chunk-CY4HDWSG.js";
import {
  useGetFilterOptions
} from "./chunk-IPLH7FAS.js";
import {
  useGetTotal
} from "./chunk-5LZDTC3Z.js";
import {
  useLoadGeoData
} from "./chunk-HLINSZP4.js";
import {
  DateRangeFilter_default
} from "./chunk-MC7YQHTQ.js";
import {
  FiltersAndWidgetsContext_default
} from "./chunk-KG7QE6MN.js";
import {
  extractFiltersFromDom
} from "./chunk-2RSB3QXO.js";
import {
  extractWidgetsFromDom
} from "./chunk-LQ3IHF25.js";
import {
  withDefaultFilterConfig
} from "./chunk-3EOZOFPD.js";
import {
  filtersToAggregations
} from "./chunk-TWJ2L7HC.js";

// src/components/FiltersManager.js
import omit from "lodash/omit.js";
import isEqual from "lodash/isEqual.js";
import qs from "qs";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState
} from "react";
import { unstable_batchedUpdates as unstableBatchedUpdates } from "react-dom";
import { useIntl } from "react-intl";
import { useForm } from "react-final-form";
import { useUIDSeed } from "react-uid";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Portal } from "@openagenda/react-portal-ssr";
import useConstant from "@openagenda/react-shared/dist/hooks/useConstant.js";
import { Fragment, jsx, jsxs } from "@emotion/react/jsx-runtime";
var FiltersManager = React.forwardRef(function FiltersManager2({
  aggregations: initialAggregations = {},
  query: initialQuery = {},
  total: initialTotal = 0,
  defaultViewport,
  filtersBase: initialFiltersBase,
  agendaUid,
  onLoad,
  choiceComponent = ChoiceFilter_default,
  dateRangeComponent = DateRangeFilter_default,
  simpleDateRangeComponent = SimpleDateRangeFilter_default,
  definedRangeComponent = DefinedRangeFilter_default,
  numberRangeComponent = NumberRangeFilter_default,
  searchComponent = SearchFilter_default,
  mapComponent = MapFilter_default,
  customComponent = CustomFilter_default,
  favoritesComponent = FavoritesFilter_default,
  timelineComponent = TimelineFilter_default,
  ...rest
}, ref) {
  const intl = useIntl();
  const form = useForm();
  const widgetSeed = useUIDSeed();
  const {
    filters,
    widgets,
    setFilters,
    setWidgets,
    filtersOptions,
    searchMethod
  } = useContext(FiltersAndWidgetsContext_default);
  const [total, setTotal] = useState(() => initialTotal);
  const [aggregations, setAggregations] = useState(() => initialAggregations);
  const filtersBaseQuery = useQuery(
    ["react-filters", "filtersBase", agendaUid],
    async () => {
      const filtersToLoad = filters.filter(
        (filter) => filter.type === "choice" && !filter.options
      );
      if (!filtersToLoad.length) {
        return {};
      }
      return (await getEvents(
        null,
        // apiClient
        filtersOptions.res,
        { uid: agendaUid },
        filters.filter(
          (filter) => filter.type === "choice" && !filter.options
        ),
        { size: 0 },
        null,
        // pageParam
        false,
        // filtersBase
        0,
        searchMethod
      )).aggregations;
    },
    {
      initialData: initialFiltersBase,
      staleTime: 1e3,
      notifyOnChangeProps: ["data", "isLoading", "error"]
    }
  );
  const getOptions = useGetFilterOptions(
    intl,
    filtersBaseQuery.data,
    aggregations
  );
  const getTotal = useGetTotal(aggregations);
  const getQuery = useCallback(() => form.getSubmittedValues(), [form]);
  const loadGeoData = useLoadGeoData(
    null,
    filtersOptions.res,
    () => form.getSubmittedValues(),
    { searchMethod }
  );
  useImperativeHandle(ref, () => ({
    getFilters: () => filters,
    getForm: () => form,
    setAggregations,
    setTotal,
    updateFiltersAndWidgets: (values, result) => {
      var _a, _b, _c;
      const widgetsOnPage = extractWidgetsFromDom();
      const filtersOnPage = extractFiltersFromDom();
      const newFilters = filtersOnPage.map((nextFilter) => {
        const completedNext = withDefaultFilterConfig(
          nextFilter,
          intl,
          filtersOptions
        );
        const found = filters.find(
          (v) => JSON.stringify(omit(v, "elemRef")) === JSON.stringify(omit(completedNext, "elemRef"))
        );
        return found && document.body.contains(found.elem) ? found : completedNext;
      });
      const newWidgets = widgetsOnPage.map((nextWidget) => {
        const found = widgets.find(
          (v) => JSON.stringify(omit(v, "elemRef")) === JSON.stringify(omit(nextWidget, "elemRef"))
        );
        return found && document.body.contains(found.elem) ? found : nextWidget;
      });
      unstableBatchedUpdates(() => {
        if (!isEqual(filters, newFilters)) {
          setFilters(newFilters);
        }
        if (!isEqual(widgets, newWidgets)) {
          setWidgets(newWidgets);
        }
        setAggregations(result.aggregations || {});
        setTotal(result.total || 0);
      });
      const mapFilter = filters.find((v) => v.type === "map");
      const mapElem = (_a = mapFilter == null ? void 0 : mapFilter.elemRef) == null ? void 0 : _a.current;
      const viewport = (_b = result.aggregations) == null ? void 0 : _b.viewport;
      if (mapElem && viewport) {
        mapElem.onQueryChange(viewport);
      }
      const timingsFilter = filters.find((v) => v.name === "timings");
      const timingsElem = (_c = timingsFilter == null ? void 0 : timingsFilter.elemRef) == null ? void 0 : _c.current;
      if (timingsElem) {
        timingsElem.onQueryChange();
      }
    },
    updateLocation: (values) => {
      const queryStr = qs.stringify(values, {
        addQueryPrefix: true,
        skipNulls: true
      });
      window.history.pushState(
        {},
        null,
        `${window.location.pathname}${queryStr}`
      );
    }
  }));
  useEffect(() => {
    if (typeof onLoad === "function") {
      const aggs = filtersToAggregations(filters);
      onLoad(initialQuery, aggs, form);
    }
  }, []);
  const widgetElems = widgets.map((widget) => {
    switch (widget.name) {
      case "total":
        return /* @__PURE__ */ jsx(Portal, { selector: widget.destSelector, children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(Total, { total, ...widget }) }) }, widgetSeed(widget));
      case "activeFilters":
        return /* @__PURE__ */ jsx(Portal, { selector: widget.destSelector, children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
          ActiveFilters,
          {
            agendaUid,
            filters,
            getOptions
          }
        ) }) }, widgetSeed(widget));
      case "favorite":
        return /* @__PURE__ */ jsx(Portal, { selector: widget.destSelector, children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
          FavoriteToggle,
          {
            agendaUid,
            widget,
            ...widget
          }
        ) }) }, widgetSeed(widget));
      default:
        return null;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Filters_default,
      {
        withRef: true,
        filters,
        getOptions,
        getTotal,
        initialViewport: initialAggregations.viewport,
        defaultViewport,
        getQuery,
        loadGeoData,
        agendaUid,
        missingValue: filtersOptions.missingValue,
        choiceComponent,
        dateRangeComponent,
        simpleDateRangeComponent,
        definedRangeComponent,
        numberRangeComponent,
        searchComponent,
        mapComponent,
        customComponent,
        favoritesComponent,
        timelineComponent,
        ...rest
      }
    ),
    widgetElems
  ] });
});
var Wrapper = forwardRef(function Wrapper2(props, ref) {
  const queryClient = useConstant(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    })
  );
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(FiltersManager, { ref, ...props }) });
});
var FiltersManager_default = Wrapper;

export {
  FiltersManager_default
};
//# sourceMappingURL=chunk-56FW7AMQ.js.map