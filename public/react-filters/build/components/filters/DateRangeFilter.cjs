var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/components/filters/DateRangeFilter.js
var DateRangeFilter_exports = {};
__export(DateRangeFilter_exports, {
  Preview: () => Preview,
  default: () => DateRangeFilter_default,
  formatValue: () => formatValue
});
module.exports = __toCommonJS(DateRangeFilter_exports);
var import_react8 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_intl5 = require("react-intl");
var import_date_fns2 = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");

// src/components/fields/DateRangePicker.js
var import_isEqual = __toESM(require("lodash/isEqual.js"), 1);
var import_isDate = __toESM(require("lodash/isDate.js"), 1);
var import_react3 = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_useIsomorphicLayoutEffect = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_useLatest = __toESM(require("react-use/lib/useLatest.js"), 1);
var import_usePrevious = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_classnames = __toESM(require("classnames"), 1);
var import_date_fns = require("date-fns");
var import_en_US = __toESM(require("date-fns/locale/en-US/index.js"), 1);
var import_react_date_range = require("@openagenda/react-date-range");
var import_intl = require("@openagenda/intl");

// src/contexts/FiltersAndWidgetsContext.js
var import_react = require("react");
var FiltersAndWidgetsContext = (0, import_react.createContext)({
  filters: [],
  widgets: [],
  setFilters: () => {
  },
  setWidgets: () => {
  },
  filtersOptions: {}
});
var FiltersAndWidgetsContext_default = FiltersAndWidgetsContext;

// src/utils/convertPhpDateFormatToDateFns.js
function convertPhpDateFormatToDateFns(phpFormat) {
  const formatMapping = {
    // Days
    d: "dd",
    // Day of the month, 2 digits with leading zeros (01 to 31)
    D: "EEE",
    // A textual representation of a day (Mon through Sun)
    j: "d",
    // Day of the month without leading zeros (1 to 31)
    l: "EEEE",
    // A full textual representation of the day of the week (Sunday through Saturday)
    N: "i",
    // ISO-8601 numeric representation of the day of the week (1 for Monday through 7 for Sunday)
    S: "o",
    // English ordinal suffix for the day of the month, 2 characters (st, nd, rd or th)
    w: "e",
    // Numeric representation of the day of the week (0 for Sunday through 6 for Saturday)
    z: "D",
    // The day of the year (starting from 0) (0 through 365)
    // Weeks
    W: "I",
    // ISO-8601 week number of year, weeks starting on Monday
    // Months
    F: "MMMM",
    // A full textual representation of a month (January through December)
    m: "MM",
    // Numeric representation of a month, with leading zeros (01 to 12)
    M: "MMM",
    // A short textual representation of a month (Jan through Dec)
    n: "M",
    // Numeric representation of a month, without leading zeros (1 to 12)
    t: "",
    // Number of days in the given month (28 through 31) (no direct equivalent in date-fns)
    // Years
    L: "",
    // Whether it's a leap year (1 if it is a leap year, 0 otherwise) (no direct equivalent in date-fns)
    o: "RRRR",
    // ISO-8601 week-numbering year (4 digits)
    Y: "yyyy",
    // A full numeric representation of a year, 4 digits
    y: "yy",
    // A two digit representation of a year
    // Time
    a: "aaa",
    // Lowercase Ante meridiem and Post meridiem (am or pm)
    A: "a",
    // Uppercase Ante meridiem and Post meridiem (AM or PM)
    B: "",
    // Swatch Internet time (000 through 999) (no direct equivalent in date-fns)
    g: "h",
    // 12-hour format of an hour without leading zeros (1 through 12)
    G: "H",
    // 24-hour format of an hour without leading zeros (0 through 23)
    h: "hh",
    // 12-hour format of an hour with leading zeros (01 through 12)
    H: "HH",
    // 24-hour format of an hour with leading zeros (00 through 23)
    i: "mm",
    // Minutes with leading zeros (00 to 59)
    s: "ss",
    // Seconds with leading zeros (00 through 59)
    u: "SSS",
    // Microseconds (added as milliseconds in date-fns)
    // Timezone
    e: "zzz",
    // Timezone identifier (e.g., America/Los_Angeles) (not directly supported, use zzz for generic support)
    T: "zz",
    // Timezone abbreviation (e.g., MST)
    Z: "X"
    // Timezone offset in seconds (e.g., -43200 to 43200)
  };
  let dateFnsFormat = "";
  let inLiteral = false;
  for (let i = 0; i < phpFormat.length; i++) {
    const char = phpFormat[i];
    if (char === "\\") {
      if (!inLiteral) {
        dateFnsFormat += "'";
        inLiteral = true;
      }
      i += 1;
      dateFnsFormat += phpFormat[i] || "";
      continue;
    }
    if (inLiteral) {
      dateFnsFormat += "'";
      inLiteral = false;
    }
    if (formatMapping[char] !== void 0) {
      dateFnsFormat += formatMapping[char];
    } else {
      dateFnsFormat += char;
    }
  }
  if (inLiteral) {
    dateFnsFormat += "'";
  }
  return dateFnsFormat;
}

// src/hooks/useLoadTimingsData.js
var import_react2 = require("react");
var import_qs = __toESM(require("qs"), 1);

// src/utils/getQuerySeparator.js
function getQuerySeparator(url) {
  try {
    const urlObj = new URL(url, "http://n");
    return urlObj.search ? "&" : "?";
  } catch (error) {
    console.error("Invalid URL:", error);
    return "?";
  }
}

// src/hooks/useLoadTimingsData.js
function useLoadTimingsData(res, queryOrFn, options = {}) {
  const { searchMethod = "get" } = options;
  return (0, import_react2.useCallback)(
    async (additionalQuery = {}, { interval, timezone } = {}) => {
      const query = typeof queryOrFn === "function" ? queryOrFn() : queryOrFn;
      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        ...additionalQuery,
        aggregations: [
          {
            type: "timings",
            // size: 2000,
            interval,
            timezone
          }
        ]
      };
      const result = await (searchMethod === "get" ? fetch(
        `${res}${getQuerySeparator(res)}${import_qs.default.stringify(params, {
          skipNulls: true
        })}`
      ) : fetch(res, {
        method: "post",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json"
        }
      })).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't load timings data");
      });
      return result.aggregations.timings;
    },
    [res, queryOrFn, searchMethod]
  );
}

// src/components/fields/DateRangePicker.js
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var useIsomorphicLayoutEffect = import_useIsomorphicLayoutEffect.default.default || import_useIsomorphicLayoutEffect.default;
var useLatest = import_useLatest.default.default || import_useLatest.default;
var usePrevious = import_usePrevious.default.default || import_usePrevious.default;
var dateDisplayFormats = {
  en: "MMM d, yyyy",
  // Jan 1, 2024
  fr: "d MMM yyyy",
  // 1 janv. 2024
  de: "d. MMM yyyy",
  // 1. Jan. 2024
  it: "d MMM yyyy",
  // 1 gen 2024
  es: "d MMM yyyy"
  // 1 ene 2024
};
var defaultGetInitialValue = () => [
  {
    startDate: null,
    endDate: -1,
    key: "selection"
  }
];
function normalizeValue(value) {
  if (!(value == null ? void 0 : value.length)) {
    return value;
  }
  return value.map((v) => ({
    startDate: (0, import_isDate.default)(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: (0, import_isDate.default)(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key
  }));
}
function getDateDisplayFormat(dateFormatStyle, dateFormat, locale) {
  if (dateFormat) {
    return dateFormatStyle === "php" ? convertPhpDateFormatToDateFns(dateFormat) : dateFormat;
  }
  const fallbackChain = (0, import_intl.getFallbackChain)(locale);
  for (const fallback of fallbackChain) {
    if (dateDisplayFormats[fallback]) {
      return dateDisplayFormats[fallback];
    }
  }
  return dateDisplayFormats[Object.keys(dateDisplayFormats).shift()];
}
function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: (0, import_date_fns.startOfMonth)(focusedDate),
    lte: (0, import_date_fns.endOfMonth)(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function DateRangePicker({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  rangeColor = "#41acdd",
  disabled,
  className,
  dateFormatStyle,
  dateFormat,
  minDate,
  maxDate,
  shownDate,
  getQuery,
  ...otherProps
}, ref) {
  const intl = (0, import_react_intl.useIntl)();
  const dateRangeRef = (0, import_react3.useRef)(null);
  const [data, setData] = (0, import_react3.useState)(() => []);
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react3.useContext)(FiltersAndWidgetsContext_default);
  const [ranges, setRanges] = (0, import_react3.useState)(
    () => input.value ?? defaultGetInitialValue()
  );
  const [dragStatus, setDragStatus] = (0, import_react3.useState)(false);
  const [focusedRange, setFocusedRange] = (0, import_react3.useState)([0, 0]);
  const latestRanges = useLatest(ranges);
  const latestFocusedRange = useLatest(focusedRange);
  const previousValue = usePrevious(input.value);
  const { onChange } = input;
  const onSelectPreviewChange = (0, import_react3.useCallback)(
    (value) => {
      var _a;
      const dateRange = dateRangeRef.current;
      setDragStatus((_a = dateRangeRef.current) == null ? void 0 : _a.calendar.state.drag.status);
      dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
    },
    [dateRangeRef]
  );
  const onDefinedPreviewChange = (0, import_react3.useCallback)(
    (value) => {
      const dateRange = dateRangeRef.current;
      return dateRange.updatePreview(
        value ? dateRange.calcNewSelection(value, typeof value === "string") : null
      );
    },
    [dateRangeRef]
  );
  const onTemporaryChange = (0, import_react3.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      if (latestFocusedRange.current[0] === 0 && latestFocusedRange.current[1] === 0 && value[0].startDate.getTime() !== value[0].endDate.getTime()) {
        onChange(value);
      }
      if (latestFocusedRange.current[0] === 0 && latestFocusedRange.current[1] === 1) {
        onChange(value);
      }
    },
    [latestFocusedRange, onChange]
  );
  const onDefinedRangeChange = (0, import_react3.useCallback)(
    (item) => {
      const value = [(item == null ? void 0 : item.selection) ? item.selection : item.range1];
      setRanges(value);
      onChange(value);
    },
    [onChange]
  );
  const disabledDay = (0, import_react3.useCallback)(() => disabled, [disabled]);
  const rdrNoSelection = (0, import_react3.useMemo)(() => {
    const range = ranges == null ? void 0 : ranges[0];
    const hasRange = range && range.endDate !== null;
    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);
  const [focusedDate, setFocusedDate] = (0, import_react3.useState)(null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  useIsomorphicLayoutEffect(() => {
    if (previousValue && !(0, import_isEqual.default)(normalizeValue(input.value), normalizeValue(previousValue)) && !(0, import_isEqual.default)(
      normalizeValue(input.value),
      normalizeValue(latestRanges.current)
    )) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges, dateRangeRef, shownDate]);
  const onShownDateChange = async (newFocusedDate) => {
    if (input.name !== "timings") {
      return;
    }
    setFocusedDate(newFocusedDate);
  };
  useIsomorphicLayoutEffect(() => {
    var _a, _b;
    if (input.name !== "timings" || !dateRangeRef.current) {
      return;
    }
    const newFocused = (_b = (_a = dateRangeRef.current.calendar) == null ? void 0 : _a.state) == null ? void 0 : _b.focusedDate;
    if (focusedDate !== newFocused) {
      setFocusedDate(newFocused);
    }
  }, [dateRangeRef, focusedDate, input.name]);
  (0, import_react3.useEffect)(() => {
    if (!focusedDate) {
      return;
    }
    loadTimingsData(
      {
        timings: focusedDateToTimingsQuery(focusedDate)
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    ).then((newData) => setData(newData ?? [])).catch((err) => {
      console.log("Failed to load timings data", err);
    });
  }, [focusedDate]);
  (0, import_react3.useImperativeHandle)(ref, () => ({
    onQueryChange: () => {
      var _a, _b, _c, _d, _e, _f;
      if (focusedDate !== ((_b = (_a = dateRangeRef.current.calendar) == null ? void 0 : _a.state) == null ? void 0 : _b.focusedDate)) {
        setFocusedDate((_d = (_c = dateRangeRef.current.calendar) == null ? void 0 : _c.state) == null ? void 0 : _d.focusedDate);
      } else {
        loadTimingsData(
          {
            timings: focusedDateToTimingsQuery(
              (_f = (_e = dateRangeRef.current.calendar) == null ? void 0 : _e.state) == null ? void 0 : _f.focusedDate
            )
          },
          {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        ).then((newData) => setData(newData ?? [])).catch((err) => {
          console.log("Failed to load timings data", err);
        });
      }
    }
  }));
  const dayContentRenderer = (0, import_react3.useCallback)(
    (day) => {
      const isActive = data.find(
        (d) => (0, import_date_fns.isSameDay)(new Date(d.key), day) && d.timingCount > 0
      );
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "span",
        {
          className: isActive ? "rdrDayWithTimings" : "rdrDayWithoutTimings",
          children: (0, import_date_fns.format)(day, "d")
        }
      );
    },
    [data]
  );
  const dateRangePickerProps = {
    showSelectionPreview: true,
    showMonthName: false,
    moveRangeOnFirstSelection: false,
    months: 1,
    ranges,
    direction: "horizontal",
    locale: dateFnsLocale || import_en_US.default,
    staticRanges,
    inputRanges,
    focusedRange,
    onRangeFocusChange: setFocusedRange,
    rangeColors: [rangeColor],
    minDate: minDate ? new Date(minDate) : void 0,
    maxDate: maxDate ? new Date(maxDate) : void 0,
    shownDate: shownDate ? new Date(shownDate) : void 0,
    onShownDateChange,
    dayContentRenderer,
    ...otherProps
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: (0, import_classnames.default)("rdrDateRangePickerWrapper", className, { rdrNoSelection }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_react_date_range.DateRange,
          {
            onPreviewChange: onSelectPreviewChange,
            onRangeFocusChange: setFocusedRange,
            ...dateRangePickerProps,
            onChange: onTemporaryChange,
            ref: dateRangeRef,
            className: void 0,
            disabledDay,
            dateDisplayFormat: getDateDisplayFormat(
              dateFormatStyle,
              dateFormat,
              intl.locale
            )
          }
        ),
        staticRanges.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_react_date_range.DefinedRange,
          {
            onPreviewChange: onDefinedPreviewChange,
            ...dateRangePickerProps,
            range: ranges[focusedRange[0]],
            onChange: onDefinedRangeChange,
            className: void 0
          }
        ) : null
      ]
    }
  );
}
var DateRangePicker_default = import_react3.default.forwardRef(DateRangePicker);

// src/components/Title.js
var import_react5 = __toESM(require("react"), 1);
var import_react_final_form = require("react-final-form");

// src/hooks/useFilterTitle.js
var import_react4 = require("react");
var import_react_intl3 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl2 = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl2 = require("react-intl");
var filterTitles_default = (0, import_react_intl2.defineMessages)({
  geo: {
    id: "ReactFilters.messages.filterTitles.geo",
    defaultMessage: "Map"
  },
  search: {
    id: "ReactFilters.messages.filterTitles.search",
    defaultMessage: "Search"
  },
  addMethod: {
    id: "ReactFilters.messages.filterTitles.addMethod",
    defaultMessage: "Provenance"
  },
  memberUid: {
    id: "ReactFilters.messages.filterTitles.memberUid",
    defaultMessage: "Member"
  },
  locationUid: {
    id: "ReactFilters.messages.filterTitles.locationUid",
    defaultMessage: "Location"
  },
  sourceAgendaUid: {
    id: "ReactFilters.messages.filterTitles.sourceAgendaUid",
    defaultMessage: "Source agenda"
  },
  originAgendaUid: {
    id: "ReactFilters.messages.filterTitles.originAgendaUid",
    defaultMessage: "Origin agenda"
  },
  featured: {
    id: "ReactFilters.messages.filterTitles.featured",
    defaultMessage: "Featured"
  },
  relative: {
    id: "ReactFilters.messages.filterTitles.relative",
    defaultMessage: "Passed / current / upcoming"
  },
  region: {
    id: "ReactFilters.messages.filterTitles.region",
    defaultMessage: "Region"
  },
  department: {
    id: "ReactFilters.messages.filterTitles.department",
    defaultMessage: "Department"
  },
  countryCode: {
    id: "ReactFilters.messages.filterTitles.countryCode",
    defaultMessage: "Country"
  },
  city: {
    id: "ReactFilters.messages.filterTitles.city",
    defaultMessage: "City"
  },
  adminLevel3: {
    id: "ReactFilters.messages.filterTitles.adminLevel3",
    defaultMessage: "Administrative level 3"
  },
  timings: {
    id: "ReactFilters.messages.filterTitles.timings",
    defaultMessage: "Date"
  },
  createdAt: {
    id: "ReactFilters.messages.filterTitles.createdAt",
    defaultMessage: "Creation date"
  },
  updatedAt: {
    id: "ReactFilters.messages.filterTitles.updatedAt",
    defaultMessage: "Date of update"
  },
  keyword: {
    id: "ReactFilters.messages.filterTitles.keyword",
    defaultMessage: "Keywords"
  },
  state: {
    id: "ReactFilters.messages.filterTitles.state",
    defaultMessage: "State"
  },
  attendanceMode: {
    id: "ReactFilters.messages.filterTitles.attendanceMode",
    defaultMessage: "Attendance mode"
  },
  status: {
    id: "ReactFilters.messages.filterTitles.status",
    defaultMessage: "Status"
  },
  district: {
    id: "ReactFilters.messages.filterTitles.district",
    defaultMessage: "District"
  },
  accessibility: {
    id: "ReactFilters.messages.filterTitles.accessibility",
    defaultMessage: "Accessibility"
  },
  languages: {
    id: "ReactFilters.messages.filterTitles.languages",
    defaultMessage: "Languages"
  }
});

// src/utils/getFilterTitle.js
function getFilterTitle(intl, providedMessages, messageKey, fieldSchema) {
  const messages3 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl2.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages3[messageKey]) {
    return intl.formatMessage(messages3[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages3) {
  const intl = (0, import_react_intl3.useIntl)();
  return (0, import_react4.useMemo)(
    () => getFilterTitle(intl, messages3, messageKey, fieldSchema),
    [intl, messages3, messageKey, fieldSchema]
  );
}

// src/components/Title.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
var subscription = { value: true };
function Title({ name, filter, component, ...rest }) {
  var _a;
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = (0, import_react_final_form.useField)(name, { subscription });
  const { input } = field;
  if (!((_a = input.value) == null ? void 0 : _a.length) && !(typeof input.value === "object" && input.value !== null)) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: title });
  }
  if (!component) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-auto", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "padding-right-xs", children: title }),
    import_react5.default.createElement(component, {
      name,
      filter,
      className: "oa-filter-value-preview",
      withTitle: false,
      ...rest
    })
  ] });
}

// src/components/Panel.js
var import_react6 = require("react");
var import_classnames2 = __toESM(require("classnames"), 1);
var import_a11yButtonActionHandler = __toESM(require("@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js"), 1);
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
function Panel({
  collapsed = true,
  setCollapsed,
  header,
  children
}) {
  const internalState = (0, import_react6.useState)(collapsed);
  const value = typeof setCollapsed === "function" ? collapsed : internalState[0];
  const updater = typeof setCollapsed === "function" ? setCollapsed : internalState[1];
  const toggleCollapsed = (0, import_react6.useMemo)(
    () => (0, import_a11yButtonActionHandler.default)((e) => {
      e.preventDefault();
      updater((v) => !v);
    }),
    [updater]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: (0, import_classnames2.default)("oa-collapse-item", { "oa-collapse-item-active": !value }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            className: "oa-collapse-header",
            role: "tab",
            tabIndex: "0",
            "aria-expanded": !value,
            onClick: toggleCollapsed,
            onKeyPress: toggleCollapsed,
            children: [
              header,
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "oa-collapse-arrow", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "i",
                {
                  className: (0, import_classnames2.default)("fa fa-lg", {
                    "fa-angle-up": !value,
                    "fa-angle-down": value
                  }),
                  "aria-hidden": "true"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: (0, import_classnames2.default)("oa-collapse-content", {
              "oa-collapse-content-active": !value,
              "oa-collapse-content-inactive": value
            }),
            role: "tabpanel",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "oa-collapse-content-box", children })
          }
        )
      ]
    }
  );
}

// src/components/ValueBadge.js
var import_classnames3 = __toESM(require("classnames"), 1);
var import_react_intl4 = require("react-intl");
var import_react7 = require("@emotion/react");
var import_intl3 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl4.defineMessages)({
  removeFilter: {
    id: "ReactFilters.ValueBadge.removeFilter",
    defaultMessage: "Remove filter"
  },
  removeFilterWithTitle: {
    id: "ReactFilters.ValueBadge.removeFilterWithTitle",
    defaultMessage: "Remove filter ({title})"
  }
});
function ValueBadge({ label, title, onRemove, disabled }) {
  const intl = (0, import_react_intl4.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames3.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react7.css`
        line-height: 18px;
        padding-top: 0;
        padding-bottom: 0;

        :hover {
          color: #da4453;
          border-color: #d43f3a;
        }
      `,
      onClick: onRemove,
      children: [
        (0, import_intl3.getLocaleValue)(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime5 = require("@emotion/react/jsx-runtime");
function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions,
  onRemove,
  disabled,
  className
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  if (valueOptions == null ? void 0 : valueOptions.length) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      ValueBadge,
      {
        label: option.label,
        onRemove: onRemove(option),
        disabled,
        title: withTitle ? title : null
      }
    ) }, option.value)) });
  }
  if (label) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      ValueBadge,
      {
        label,
        onRemove,
        disabled,
        title: withTitle ? title : null
      }
    ) });
  }
  return null;
}

// src/components/filters/DateRangeFilter.js
var import_jsx_runtime6 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl5.defineMessages)({
  dateRange: {
    id: "ReactFilters.DateRangeFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  startDate: {
    id: "ReactFilters.DateRangeFilter.startDate",
    defaultMessage: "Start"
  },
  endDate: {
    id: "ReactFilters.DateRangeFilter.endDate",
    defaultMessage: "End"
  },
  until: {
    id: "ReactFilters.DateRangeFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.DateRangeFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription2 = { value: true };
function formatDateValue(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? (0, import_date_fns2.parseISO)(value) : value;
}
function formatValue(value) {
  if (value === void 0) {
    return [
      {
        startDate: null,
        endDate: null,
        key: "selection"
      }
    ];
  }
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = (0, import_date_fns_tz.getTimezoneOffset)(value.tz, value.gte) - (0, import_date_fns_tz.getTimezoneOffset)(currentTz, value.gte);
  if (Array.isArray(value)) {
    return value.map((v) => {
      const startDate = formatDateValue(v.gte);
      const endDate = formatDateValue(v.lte);
      return {
        ...v,
        startDate: tzDiff && startDate ? (0, import_date_fns_tz.utcToZonedTime)(startDate, v.tz) : startDate,
        endDate: tzDiff && endDate ? (0, import_date_fns_tz.utcToZonedTime)(endDate, v.tz) : endDate
      };
    });
  }
  if (typeof value === "object") {
    const startDate = formatDateValue(value.gte);
    const endDate = formatDateValue(value.lte);
    return [
      {
        startDate: tzDiff && startDate ? (0, import_date_fns_tz.utcToZonedTime)(startDate, value.tz) : startDate,
        endDate: tzDiff && endDate ? (0, import_date_fns_tz.utcToZonedTime)(endDate, value.tz) : endDate,
        key: "selection"
      }
    ];
  }
  return value;
}
function parseValue(value) {
  var _a;
  if (!value) {
    return value;
  }
  const [selection] = value;
  if (selection.startDate === null && selection.endDate === null) {
    return void 0;
  }
  const gte = ((_a = selection.startDate) == null ? void 0 : _a.toISOString()) ?? null;
  const lte = (selection.endDate ? (0, import_date_fns2.endOfDay)(selection.endDate) : selection.endDate).toISOString();
  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;
  result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return result;
}
function Preview({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl5.useIntl)();
  const { input } = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];
  const selectedStaticRange = (0, import_react8.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value, tz)),
    [value, staticRanges, tz]
  );
  const singleDay = (0, import_react8.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns2.isSameDay)(value.startDate, value.endDate),
    [value]
  );
  const onRemove = (0, import_react8.useCallback)(
    (e) => {
      e.stopPropagation();
      if (disabled) {
        return;
      }
      input.onChange(void 0);
    },
    [input, disabled]
  );
  let label;
  if (!(value == null ? void 0 : value.startDate) && !(value == null ? void 0 : value.endDate)) {
    return null;
  }
  const formatDate = (v) => intl.formatDate(
    v
    /* , { timeZone: tz } */
  );
  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages2.until, {
      date: formatDate(value.endDate)
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages2.from, {
      date: formatDate(value.startDate)
    });
  } else {
    label = singleDay ? formatDate(value.startDate) : intl.formatMessage(messages2.dateRange, {
      startDate: formatDate(value.startDate),
      endDate: formatDate(value.endDate)
    });
  }
  return import_react8.default.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var DateRangeFilter = import_react8.default.forwardRef(function DateRangeFilter2({
  name,
  staticRanges,
  inputRanges,
  rangeColor,
  className,
  dateFormatStyle,
  dateFormat,
  minDate,
  maxDate,
  shownDate,
  getQuery
}, ref) {
  const intl = (0, import_react_intl5.useIntl)();
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    import_react_final_form2.Field,
    {
      ref,
      name,
      subscription: subscription2,
      parse: parseValue,
      format: formatValue,
      component: DateRangePicker_default,
      staticRanges,
      inputRanges,
      startDatePlaceholder: intl.formatMessage(messages2.startDate),
      endDatePlaceholder: intl.formatMessage(messages2.endDate),
      rangeColor,
      className,
      dateFormatStyle,
      dateFormat,
      minDate,
      maxDate,
      shownDate,
      getQuery
    }
  );
});
var Collapsable = import_react8.default.forwardRef(function Collapsable2({ name, filter, component, disabled, staticRanges, inputRanges, ...rest }, ref) {
  const [collapsed, setCollapsed] = (0, import_react8.useState)(true);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    Panel,
    {
      header: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        Title,
        {
          name,
          filter,
          component: Preview,
          staticRanges,
          disabled
        }
      ),
      collapsed,
      setCollapsed,
      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        DateRangeFilter,
        {
          ref,
          name,
          filter,
          component,
          staticRanges,
          inputRanges,
          disabled,
          collapsed,
          ...rest
        }
      )
    }
  );
});
var exported = import_react8.default.memo(DateRangeFilter);
exported.Preview = Preview;
exported.Collapsable = Collapsable;
var DateRangeFilter_default = exported;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Preview,
  formatValue
});
//# sourceMappingURL=DateRangeFilter.cjs.map