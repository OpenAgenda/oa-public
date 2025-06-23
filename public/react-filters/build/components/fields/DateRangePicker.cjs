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

// src/components/fields/DateRangePicker.js
var DateRangePicker_exports = {};
__export(DateRangePicker_exports, {
  default: () => DateRangePicker_default
});
module.exports = __toCommonJS(DateRangePicker_exports);
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
//# sourceMappingURL=DateRangePicker.cjs.map