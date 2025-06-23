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

// src/hooks/index.js
var hooks_exports = {};
__export(hooks_exports, {
  useActiveFilters: () => useActiveFilters,
  useChoiceState: () => useChoiceState,
  useFavoriteState: () => useFavoriteState,
  useFavoritesOnChange: () => useFavoritesOnChange,
  useField: () => import_react_final_form5.useField,
  useFilterTitle: () => useFilterTitle,
  useFilters: () => useFilters,
  useForm: () => import_react_final_form5.useForm,
  useGetFilterOptions: () => useGetFilterOptions,
  useGetTotal: () => useGetTotal,
  useLoadGeoData: () => useLoadGeoData,
  useLoadTimingsData: () => useLoadTimingsData
});
module.exports = __toCommonJS(hooks_exports);

// src/hooks/useActiveFilters.js
var import_react_final_form3 = require("react-final-form");
var import_react9 = require("react");

// src/utils/staticRangesFirst.js
function staticRangesFirst(a, b) {
  if (a.staticRanges && !b.staticRanges) {
    return -1;
  }
  if (!a.staticRanges && b.staticRanges) {
    return 1;
  }
  return 0;
}

// src/utils/customFirst.js
function customFirst(a, b) {
  if (a.type === "custom" && b.type !== "custom") {
    return -1;
  }
  if (a.type !== "custom" && b.type === "custom") {
    return 1;
  }
  return 0;
}

// src/components/filters/DateRangeFilter.js
var import_react8 = __toESM(require("react"), 1);
var import_react_final_form2 = require("react-final-form");
var import_react_intl14 = require("react-intl");
var import_date_fns3 = require("date-fns");
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
var import_react_intl12 = require("react-intl");

// src/utils/dateRanges.js
var import_date_fns2 = require("date-fns");
var import_react_intl2 = require("react-intl");
var messages = (0, import_react_intl2.defineMessages)({
  today: {
    id: "ReactFilters.dateRanges.today",
    defaultMessage: "Today"
  },
  tomorrow: {
    id: "ReactFilters.dateRanges.tomorrow",
    defaultMessage: "Tomorrow"
  },
  thisWeekend: {
    id: "ReactFilters.dateRanges.thisWeekend",
    defaultMessage: "This week-end"
  },
  currentWeek: {
    id: "ReactFilters.dateRanges.currentWeek",
    defaultMessage: "Current week"
  },
  currentMonth: {
    id: "ReactFilters.dateRanges.currentMonth",
    defaultMessage: "Current month"
  }
});
function getClosestDayAfter(dayOfWeek, fromDate = /* @__PURE__ */ new Date()) {
  const dayOfWeekMap = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thur: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7
  };
  const offsetDays = dayOfWeekMap[dayOfWeek] - (0, import_date_fns2.getISODay)(fromDate);
  return (0, import_date_fns2.addDays)(fromDate, offsetDays);
}
function isSelected(range, _timeZone) {
  const definedRange = this.range();
  return range && ((0, import_date_fns2.isSameDay)(range.startDate, definedRange.startDate) || range.startDate === definedRange.startDate) && ((0, import_date_fns2.isSameDay)(range.endDate, definedRange.endDate) || range.endDate === definedRange.endDate);
}
function createStaticRanges(ranges) {
  return ranges.map((range) => ({ isSelected, ...range }));
}
function dateRanges(intl, opts = {}) {
  const { dateFnsLocale } = opts;
  const nextSaturday = getClosestDayAfter("Sat");
  const startOfWeekend = (0, import_date_fns2.startOfDay)(nextSaturday);
  const endOfWeekend = (0, import_date_fns2.endOfDay)((0, import_date_fns2.addDays)(nextSaturday, 1));
  const now = /* @__PURE__ */ new Date();
  const defineds = {
    startOfToday: (0, import_date_fns2.startOfDay)(now, { locale: dateFnsLocale }),
    endOfToday: (0, import_date_fns2.endOfDay)(now, { locale: dateFnsLocale }),
    startOfTomorrow: (0, import_date_fns2.startOfDay)((0, import_date_fns2.addDays)(now, 1), { locale: dateFnsLocale }),
    endOfTomorrow: (0, import_date_fns2.endOfDay)((0, import_date_fns2.addDays)(now, 1), { locale: dateFnsLocale }),
    startOfWeek: (0, import_date_fns2.startOfWeek)(now, { locale: dateFnsLocale }),
    endOfWeek: (0, import_date_fns2.endOfWeek)(now, { locale: dateFnsLocale }),
    startOfMonth: (0, import_date_fns2.startOfMonth)(now, { locale: dateFnsLocale }),
    endOfMonth: (0, import_date_fns2.endOfMonth)(now, { locale: dateFnsLocale }),
    startOfWeekend,
    endOfWeekend
  };
  const defaults2 = {
    staticRanges: createStaticRanges([
      {
        id: "today",
        label: intl.formatMessage(messages.today),
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday
        })
      },
      {
        id: "tomorrow",
        label: intl.formatMessage(messages.tomorrow),
        range: () => ({
          startDate: defineds.startOfTomorrow,
          endDate: defineds.endOfTomorrow
        })
      },
      {
        id: "thisWeekend",
        label: intl.formatMessage(messages.thisWeekend),
        range: () => ({
          startDate: defineds.startOfWeekend,
          endDate: defineds.endOfWeekend
        })
      },
      {
        id: "currentWeek",
        label: intl.formatMessage(messages.currentWeek),
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek
        })
      },
      {
        id: "currentMonth",
        label: intl.formatMessage(messages.currentMonth),
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth
        })
      }
    ]),
    inputRanges: []
  };
  return {
    staticRanges: opts.staticRanges ? opts.staticRanges.reduce((accu, next) => {
      if (typeof next === "string") {
        const result = defaults2.staticRanges.find((w) => w.id === next);
        if (result) accu.push(result);
        else console.log(`Cannot found static range "${next}"`);
      } else {
        accu.push(next);
      }
      return accu;
    }, []) : defaults2.staticRanges,
    inputRanges: opts.inputRanges || defaults2.inputRanges
  };
}

// src/utils/withDefaultFilterConfig.js
var import_defaults = __toESM(require("lodash/defaults.js"), 1);
var import_intl2 = require("@openagenda/intl");

// src/messages/relative.js
var import_react_intl3 = require("react-intl");
var relative_default = (0, import_react_intl3.defineMessages)({
  passed: {
    id: "ReactFilters.messages.relative.passed",
    defaultMessage: "Passed"
  },
  current: {
    id: "ReactFilters.messages.relative.current",
    defaultMessage: "Current"
  },
  upcoming: {
    id: "ReactFilters.messages.relative.upcoming",
    defaultMessage: "Upcoming"
  }
});

// src/messages/attendanceMode.js
var import_react_intl4 = require("react-intl");
var attendanceMode_default = (0, import_react_intl4.defineMessages)({
  offline: {
    id: "ReactFilters.messages.attendanceMode.offline",
    defaultMessage: "In situ"
  },
  online: {
    id: "ReactFilters.messages.attendanceMode.online",
    defaultMessage: "Online"
  },
  mixed: {
    id: "ReactFilters.messages.attendanceMode.mixed",
    defaultMessage: "Mixed"
  }
});

// src/messages/provenance.js
var import_react_intl5 = require("react-intl");
var provenance_default = (0, import_react_intl5.defineMessages)({
  contribution: {
    id: "ReactFilters.messages.provenance.contribution",
    defaultMessage: "Contribution"
  },
  aggregation: {
    id: "ReactFilters.messages.provenance.aggregation",
    defaultMessage: "Aggregation"
  },
  share: {
    id: "ReactFilters.messages.provenance.share",
    defaultMessage: "Share"
  }
});

// src/messages/featured.js
var import_react_intl6 = require("react-intl");
var featured_default = (0, import_react_intl6.defineMessages)({
  featured: {
    id: "ReactFilters.messages.featured.featured",
    defaultMessage: "Featured"
  }
});

// src/messages/state.js
var import_react_intl7 = require("react-intl");
var state_default = (0, import_react_intl7.defineMessages)({
  refused: {
    id: "ReactFilters.messages.state.refused",
    defaultMessage: "Refused"
  },
  toModerate: {
    id: "ReactFilters.messages.state.toModerate",
    defaultMessage: "To moderate"
  },
  controlled: {
    id: "ReactFilters.messages.state.controlled",
    defaultMessage: "Controlled"
  },
  published: {
    id: "ReactFilters.messages.state.published",
    defaultMessage: "Published"
  }
});

// src/messages/status.js
var import_react_intl8 = require("react-intl");
var status_default = (0, import_react_intl8.defineMessages)({
  programmed: {
    id: "ReactFilters.messages.status.programmed",
    // 1
    defaultMessage: "Programmed"
  },
  rescheduled: {
    id: "ReactFilters.messages.status.rescheduled",
    // 2
    defaultMessage: "Rescheduled"
  },
  movedOnline: {
    id: "ReactFilters.messages.status.movedOnline",
    // 3
    defaultMessage: "Moved online"
  },
  postponed: {
    id: "ReactFilters.messages.status.postponed",
    // 4
    defaultMessage: "Postponed"
  },
  full: {
    id: "ReactFilters.messages.status.full",
    // 5
    defaultMessage: "Fully booked"
  },
  cancelled: {
    id: "ReactFilters.messages.status.cancelled",
    // 6
    defaultMessage: "Cancelled"
  }
});

// src/messages/boolean.js
var import_react_intl9 = require("react-intl");
var boolean_default = (0, import_react_intl9.defineMessages)({
  selected: {
    id: "ReactFilters.messages.boolean.selected",
    defaultMessage: "Selected"
  },
  notSelected: {
    id: "ReactFilters.messages.boolean.notSelected",
    defaultMessage: "Not selected"
  }
});

// src/messages/accessibilities.js
var import_react_intl10 = require("react-intl");
var accessibilities_default = (0, import_react_intl10.defineMessages)({
  hi: {
    id: "ReactFilters.messages.accessiblities.hi",
    defaultMessage: "Hearing impairment"
  },
  vi: {
    id: "ReactFilters.messages.accessiblities.vi",
    defaultMessage: "Visual impairment"
  },
  pi: {
    id: "ReactFilters.messages.accessiblities.pi",
    defaultMessage: "Psychic impairment"
  },
  mi: {
    id: "ReactFilters.messages.accessiblities.mi",
    defaultMessage: "Motor impairment"
  },
  ii: {
    id: "ReactFilters.messages.accessiblities.ii",
    defaultMessage: "Intellectual impairment"
  }
});

// src/utils/withDefaultFilterConfig.js
function assignDateRanges(filter, intl, dataFnsLocale) {
  if (filter.type === "definedRange") {
    Object.assign(
      filter,
      dateRanges(intl, {
        dataFnsLocale,
        staticRanges: filter.staticRanges,
        inputRanges: filter.inputRanges
      })
    );
  }
}
function withDefaultFilterConfig(filter, intl, opts = {}) {
  const { missingValue, dataFnsLocale } = opts;
  switch (filter.name) {
    case "viewport":
      (0, import_defaults.default)(filter, {
        type: "none"
      });
      break;
    case "geo":
      (0, import_defaults.default)(filter, {
        type: "map",
        aggregation: null,
        // props for MapFilter
        tileAttribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        tileUrl: opts.mapTiles ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      });
      break;
    case "addMethod":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(provenance_default.contribution),
            value: "contribution"
          },
          {
            label: intl.formatMessage(provenance_default.aggregation),
            value: "aggregation"
          },
          {
            label: intl.formatMessage(provenance_default.share),
            value: "share"
          }
        ],
        aggregation: {
          type: "addMethods"
        }
      });
      break;
    case "accessibility":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(accessibilities_default.hi),
            value: "hi"
          },
          {
            label: intl.formatMessage(accessibilities_default.vi),
            value: "vi"
          },
          {
            label: intl.formatMessage(accessibilities_default.pi),
            value: "pi"
          },
          {
            label: intl.formatMessage(accessibilities_default.mi),
            value: "mi"
          },
          {
            label: intl.formatMessage(accessibilities_default.ii),
            value: "ii"
          }
        ],
        aggregation: {
          type: "accessibilities"
        }
      });
      break;
    case "languages":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null
      });
      break;
    case "memberUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "member.name",
        aggregation: {
          type: "members"
        }
      });
      break;
    case "timings":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "createdAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "updatedAt":
      (0, import_defaults.default)(filter, {
        type: "dateRange",
        aggregation: null
      });
      assignDateRanges(filter, intl, dataFnsLocale);
      break;
    case "state":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(state_default.refused),
            value: "-1"
          },
          {
            label: intl.formatMessage(state_default.toModerate),
            value: "0"
          },
          {
            label: intl.formatMessage(state_default.controlled),
            value: "1"
          },
          {
            label: intl.formatMessage(state_default.published),
            value: "2"
          }
        ],
        aggregation: {
          type: "states"
        }
      });
      break;
    case "search":
      (0, import_defaults.default)(filter, {
        type: "search",
        aggregation: null
      });
      break;
    case "locationUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "location.name",
        aggregation: {
          type: "locations"
        }
      });
      break;
    case "sourceAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "sourceAgendas"
        }
      });
      break;
    case "originAgendaUid":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        labelKey: "agenda.title",
        aggregation: {
          type: "originAgendas"
        }
      });
      break;
    case "featured":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(featured_default.featured),
            value: "true"
          }
        ],
        aggregation: null
      });
      break;
    case "relative":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(relative_default.passed),
            value: "passed"
          },
          {
            label: intl.formatMessage(relative_default.current),
            value: "current"
          },
          {
            label: intl.formatMessage(relative_default.upcoming),
            value: "upcoming"
          }
        ]
      });
      break;
    case "attendanceMode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        aggregation: {
          type: "attendanceModes"
        },
        options: [
          {
            label: intl.formatMessage(attendanceMode_default.offline),
            value: "1"
          },
          {
            label: intl.formatMessage(attendanceMode_default.online),
            value: "2"
          },
          {
            label: intl.formatMessage(attendanceMode_default.mixed),
            value: "3"
          }
        ]
      });
      break;
    case "region":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "regions"
        }
      });
      break;
    case "department":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "departments"
        }
      });
      break;
    case "city":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "cities"
        }
      });
      break;
    case "countryCode":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "countryCodes"
        }
      });
      break;
    case "adminLevel3":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "adminLevels3"
        }
      });
      break;
    case "district":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        missingValue,
        aggregation: {
          type: "districts"
        }
      });
      break;
    case "keyword":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: null,
        // from the aggregation
        aggregation: {
          type: "keywords"
        }
      });
      break;
    case "status":
      (0, import_defaults.default)(filter, {
        type: "choice",
        options: [
          {
            label: intl.formatMessage(status_default.programmed),
            value: "1"
          },
          {
            label: intl.formatMessage(status_default.rescheduled),
            value: "2"
          },
          {
            label: intl.formatMessage(status_default.movedOnline),
            value: "3"
          },
          {
            label: intl.formatMessage(status_default.postponed),
            value: "4"
          },
          {
            label: intl.formatMessage(status_default.full),
            value: "5"
          },
          {
            label: intl.formatMessage(status_default.cancelled),
            value: "6"
          }
        ],
        aggregation: {
          type: "status"
        }
      });
      break;
    case "favorites":
      (0, import_defaults.default)(filter, {
        type: "favorites",
        aggregation: null
      });
      break;
    default:
      break;
  }
  const { fieldSchema } = filter;
  if ((fieldSchema == null ? void 0 : fieldSchema.fieldType) === "boolean") {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: [
        {
          label: intl.formatMessage(boolean_default.selected),
          value: "true"
        },
        {
          label: intl.formatMessage(boolean_default.notSelected),
          value: "false"
        }
      ],
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      }
    });
  } else if (["number", "integer"].includes(fieldSchema == null ? void 0 : fieldSchema.fieldType)) {
    (0, import_defaults.default)(filter, {
      type: "numberRange",
      name: fieldSchema.field,
      fieldSchema,
      aggregation: null
    });
  } else if (fieldSchema) {
    (0, import_defaults.default)(filter, {
      name: fieldSchema.field,
      type: "choice",
      fieldSchema,
      options: !filter.aggregationOnly ? fieldSchema.options.map((option) => ({
        ...option,
        label: (0, import_intl2.getLocaleValue)(option.label, intl.locale),
        value: String(option.id)
      })) : null,
      missingValue,
      aggregation: {
        type: "additionalFields",
        field: fieldSchema.field
      },
      labelKey: "label"
    });
  }
  return filter;
}

// src/utils/getAdditionalFilters.js
var isAdditionalField = (field) => field.schemaId && [
  "checkbox",
  "radio",
  "multiselect",
  "boolean",
  "select",
  "number",
  "integer"
].includes(field.fieldType);
var getFieldPath = (field, path = "") => path.length ? `${path}:${field.slug ?? field.field}` : field.slug ?? field.field;
function getAdditionalFilters(fields, path = "") {
  return fields.reduce((additionalFilters, field) => {
    const fieldPath = getFieldPath(field, path);
    if (field.schema) {
      return additionalFilters.concat(
        getAdditionalFilters(field.schema.fields, fieldPath)
      );
    }
    if (!isAdditionalField(field)) {
      return additionalFilters;
    }
    additionalFilters.push({
      name: fieldPath,
      fieldSchema: {
        ...field,
        field: fieldPath
      }
    });
    return additionalFilters;
  }, []);
}

// src/utils/getFilters.js
var isNameMatching = (name1, name2) => name1.replace(".", ":") === name2.replace(".", ":");
function getFilters(intl, fields, opts = {}) {
  const { staticRanges, inputRanges } = dateRanges(intl, opts);
  const { include, sort, exclude } = opts;
  const standardFilters = [
    { name: "viewport" },
    { name: "geo" },
    { name: "search" },
    { name: "addMethod" },
    { name: "memberUid" },
    { name: "languages" },
    { name: "locationUid" },
    { name: "sourceAgendaUid" },
    { name: "originAgendaUid" },
    { name: "featured" },
    { name: "relative" },
    { name: "timings", staticRanges, inputRanges },
    { name: "createdAt", staticRanges, inputRanges },
    { name: "updatedAt", staticRanges, inputRanges },
    { name: "state" },
    { name: "attendanceMode" },
    { name: "countryCode" },
    { name: "region" },
    { name: "department" },
    { name: "adminLevel3" },
    { name: "city" },
    { name: "district" },
    { name: "keyword" },
    { name: "status" },
    { name: "accessibility" }
  ];
  const defaultSortFilters = standardFilters.concat(getAdditionalFilters(fields)).filter(
    (filter) => !exclude || !exclude.find((f) => isNameMatching(f, filter.name))
  ).filter(
    (filter) => !include || !!include.find((f) => isNameMatching(f, filter.name))
  );
  const finalCompleteSort = sort ?? include ?? [];
  defaultSortFilters.forEach((filter) => {
    if (finalCompleteSort.includes(filter.name)) {
      return;
    }
    finalCompleteSort.push(filter.name);
  });
  return finalCompleteSort.map((filterName) => {
    const match = defaultSortFilters.find((filter) => isNameMatching(filter.name, filterName));
    if (!match) {
      console.warn(
        "filter %s did not match any known field or filter",
        filterName
      );
    }
    return match;
  }).filter((f) => !!f).map((filter) => withDefaultFilterConfig(filter, intl, {
    dateFnsLocale: opts.dateFnsLocale,
    mapTiles: opts.mapTiles,
    missingValue: opts.missingValue
  }));
}

// src/utils/getFilterTitle.js
var import_intl3 = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl11 = require("react-intl");
var filterTitles_default = (0, import_react_intl11.defineMessages)({
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
  const messages5 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl3.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages5[messageKey]) {
    return intl.formatMessage(messages5[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages5) {
  const intl = (0, import_react_intl12.useIntl)();
  return (0, import_react4.useMemo)(
    () => getFilterTitle(intl, messages5, messageKey, fieldSchema),
    [intl, messages5, messageKey, fieldSchema]
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
var import_react_intl13 = require("react-intl");
var import_react7 = require("@emotion/react");
var import_intl4 = require("@openagenda/intl");
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl13.defineMessages)({
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
  const intl = (0, import_react_intl13.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages2.removeFilterWithTitle, { title }) : intl.formatMessage(messages2.removeFilter);
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
        (0, import_intl4.getLocaleValue)(label, intl.locale),
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
var messages3 = (0, import_react_intl14.defineMessages)({
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
  return typeof value === "string" ? (0, import_date_fns3.parseISO)(value) : value;
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
  const lte = (selection.endDate ? (0, import_date_fns3.endOfDay)(selection.endDate) : selection.endDate).toISOString();
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
  const intl = (0, import_react_intl14.useIntl)();
  const { input } = (0, import_react_final_form2.useField)(name, { subscription: subscription2 });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];
  const selectedStaticRange = (0, import_react8.useMemo)(
    () => value && staticRanges.find((v) => v.isSelected(value, tz)),
    [value, staticRanges, tz]
  );
  const singleDay = (0, import_react8.useMemo)(
    () => (value == null ? void 0 : value.startDate) && (value == null ? void 0 : value.endDate) && (0, import_date_fns3.isSameDay)(value.startDate, value.endDate),
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
    label = intl.formatMessage(messages3.until, {
      date: formatDate(value.endDate)
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages3.from, {
      date: formatDate(value.startDate)
    });
  } else {
    label = singleDay ? formatDate(value.startDate) : intl.formatMessage(messages3.dateRange, {
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
  const intl = (0, import_react_intl14.useIntl)();
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
      startDatePlaceholder: intl.formatMessage(messages3.startDate),
      endDatePlaceholder: intl.formatMessage(messages3.endDate),
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

// src/utils/matchQuery.js
var import_isMatch = __toESM(require("lodash/isMatch.js"), 1);
var import_omitBy = __toESM(require("lodash/omitBy.js"), 1);
var import_isEmpty = __toESM(require("lodash/isEmpty.js"), 1);
function matchQuery(a, b) {
  return (0, import_isMatch.default)((0, import_omitBy.default)(a, import_isEmpty.default), (0, import_omitBy.default)(b, import_isEmpty.default));
}

// src/utils/matchFilter.js
function matchFilter(filter, values, entry) {
  const [key, value] = entry;
  if (filter.type === "custom" && filter.activeFilterLabel) {
    return key in filter.query && matchQuery(values, filter.query);
  }
  if (filter.type === "favorites" && filter.activeFilterLabel) {
    return !!values.favorites;
  }
  if (filter.type === "definedRange" && filter.name === key) {
    const formattedValue = formatValue(value)[0];
    return !!filter.staticRanges.find((v) => v.isSelected(formattedValue));
  }
  return filter.name === key;
}

// src/hooks/useActiveFilters.js
function useActiveFilters(filters) {
  const { values } = (0, import_react_final_form3.useFormState)({ subscription: { values: true } });
  const sortedFilters = (0, import_react9.useMemo)(
    () => filters.map(({ destSelector, ...filter }) => filter).sort(staticRangesFirst).sort(customFirst),
    [filters]
  );
  return (0, import_react9.useMemo)(
    () => Object.entries(values).reduce((accu, entry) => {
      const matchingFilter = sortedFilters.find((filter) => matchFilter(filter, values, entry));
      if (matchingFilter && !accu.includes(matchingFilter)) {
        accu.push(matchingFilter);
      }
      return accu;
    }, []),
    [sortedFilters, values]
  );
}

// src/hooks/useChoiceState.js
var import_react10 = require("react");
var import_useIsomorphicLayoutEffect2 = __toESM(require("react-use/lib/useIsomorphicLayoutEffect.js"), 1);
var import_usePrevious2 = __toESM(require("react-use/lib/usePrevious.js"), 1);
var import_react_intl15 = require("react-intl");
var import_fuse = __toESM(require("fuse.js"), 1);
var import_useConstant = __toESM(require("@openagenda/react-shared/dist/hooks/useConstant.js"), 1);
var useIsomorphicLayoutEffect2 = import_useIsomorphicLayoutEffect2.default.default || import_useIsomorphicLayoutEffect2.default;
var usePrevious2 = import_usePrevious2.default.default || import_usePrevious2.default;
function getCollator(locale, defaultLocale) {
  try {
    return new Intl.Collator(locale, {
      sensitivity: "base",
      usage: "sort"
    });
  } catch {
    return new Intl.Collator(defaultLocale, {
      sensitivity: "base",
      usage: "sort"
    });
  }
}
function filterOptions({ options, fuse, searchValue, sort, collator }) {
  if (searchValue === "") {
    if (sort === "alphabetical") {
      return [...options].sort((a, b) => collator.compare(a.label, b.label));
    }
    return options;
  }
  return fuse.search(searchValue).map((v) => v.item);
}
function useChoiceState({
  filter,
  getOptions,
  pageSize,
  collapsed = false,
  sort = null
}) {
  const intl = (0, import_react_intl15.useIntl)();
  const [countOptions, setCountOptions] = (0, import_react10.useState)(pageSize);
  const options = (0, import_react10.useMemo)(() => getOptions(filter), [filter, getOptions]);
  const fuse = (0, import_useConstant.default)(
    () => new import_fuse.default(options, {
      threshold: 0.3,
      ignoreLocation: true,
      keys: ["label"]
    })
  );
  const collator = (0, import_react10.useMemo)(
    () => getCollator(intl.locale, intl.defaultLocale),
    [intl.defaultLocale, intl.locale]
  );
  const [searchValue, setSearchValue] = (0, import_react10.useState)("");
  const previousSearchValue = usePrevious2(searchValue);
  const [foundOptions, setFoundOptions] = (0, import_react10.useState)(
    filterOptions({
      options,
      fuse,
      searchValue,
      sort,
      collator
    })
  );
  const moreOptions = (0, import_react10.useCallback)(
    () => setCountOptions((v) => v + pageSize),
    [pageSize]
  );
  const lessOptions = (0, import_react10.useCallback)(() => setCountOptions(pageSize), [pageSize]);
  const previousCollpased = usePrevious2(collapsed);
  useIsomorphicLayoutEffect2(() => {
    if (previousCollpased && !collapsed) {
      lessOptions();
    }
  }, [collapsed, lessOptions, previousCollpased]);
  const hasMoreOptions = countOptions < foundOptions.length;
  const onSearchChange = (0, import_react10.useCallback)((e) => setSearchValue(e.target.value), []);
  useIsomorphicLayoutEffect2(() => {
    if (options !== fuse._docs) {
      fuse.setCollection(options);
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, sort, collator]);
  useIsomorphicLayoutEffect2(() => {
    if (previousSearchValue !== void 0 && searchValue !== previousSearchValue) {
      const newOptions = filterOptions({
        options,
        fuse,
        searchValue,
        sort,
        collator
      });
      setFoundOptions(newOptions);
    }
  }, [fuse, searchValue, options, previousSearchValue, sort, collator]);
  return {
    options,
    searchValue,
    onSearchChange,
    foundOptions,
    countOptions,
    hasMoreOptions,
    moreOptions,
    lessOptions
  };
}

// src/hooks/useFavoritesOnChange.js
var import_react11 = require("react");
var import_react_final_form4 = require("react-final-form");

// src/utils/updateFormValues.js
function updateFormValues(form, query, active = true) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, void 0);
        }
      }
    }
  });
}

// src/hooks/useFavoritesOnChange.js
function useFavoritesOnChange(eventUids, { isExclusive } = {}) {
  const form = (0, import_react_final_form4.useForm)();
  return (0, import_react11.useCallback)(
    (e) => {
      var _a;
      e.preventDefault();
      e.stopPropagation();
      const query = form.getState().values;
      const matchingQuery = {
        uid: (eventUids == null ? void 0 : eventUids.length) ? eventUids.map(String) : ["-1"],
        favorites: "1"
      };
      const isMatchQuery = matchQuery(query, matchingQuery);
      const newQuery = isExclusive && !isMatchQuery ? form.getRegisteredFields().reduce((accu, next) => {
        if (next in matchingQuery) {
          accu[next] = matchingQuery[next];
          return accu;
        }
        accu[next] = void 0;
        return accu;
      }, {}) : matchingQuery;
      if (!((_a = newQuery.uid) == null ? void 0 : _a.length)) {
        newQuery.uid = ["-1"];
      }
      updateFormValues(form, newQuery, !isMatchQuery);
    },
    [isExclusive, form, eventUids]
  );
}

// src/hooks/useFavoriteState.js
var import_react12 = require("react");
var import_use_local_storage_state = require("use-local-storage-state");
var useFavoriteLocalStorageState = (0, import_use_local_storage_state.createLocalStorageStateHook)("favorite-events");
function useFavoriteState(agendaUid) {
  const [value, setValue] = useFavoriteLocalStorageState();
  const setAgendaValue = (0, import_react12.useCallback)(
    (fnOrValue) => {
      if (typeof fnOrValue === "function") {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue(prev == null ? void 0 : prev[agendaUid])
        }));
      } else {
        setValue((prev) => ({
          ...prev,
          [agendaUid]: fnOrValue
        }));
      }
    },
    [setValue, agendaUid]
  );
  return [value == null ? void 0 : value[agendaUid], setAgendaValue];
}

// src/hooks/useFilters.js
var import_react13 = require("react");
var import_react_uid = require("react-uid");
function useFilters(intl, fields, opts = {}) {
  const seed = (0, import_react_uid.useUIDSeed)();
  return (0, import_react13.useMemo)(
    () => getFilters(intl, fields, opts).map((filter) => ({
      ...filter,
      id: seed(filter),
      elemRef: (0, import_react13.createRef)()
    })),
    [
      intl,
      fields,
      seed,
      opts.dateFnsLocale,
      opts.staticRanges,
      opts.inputRanges,
      opts.missingValue,
      opts.mapTiles,
      opts.exclude,
      opts.include
    ]
  );
}

// src/hooks/useGetFilterOptions.js
var import_get = __toESM(require("lodash/get.js"), 1);
var import_react14 = require("react");
var import_react_intl16 = require("react-intl");
var import_intl5 = require("@openagenda/intl");
var messages4 = (0, import_react_intl16.defineMessages)({
  emptyOption: {
    id: "ReactFilters.useGetFilterOptions.emptyOption",
    defaultMessage: "(Without value)"
  }
});
function useGetFilterOptions(intl, filtersBase, aggregations) {
  return (0, import_react14.useCallback)(
    (filter) => {
      var _a;
      const missingLabel = intl.formatMessage(messages4.emptyOption);
      if (filter.options) {
        const missingOption = filter.missingValue ? (_a = filtersBase == null ? void 0 : filtersBase[filter.name]) == null ? void 0 : _a.find((v) => {
          const dataKey = "id" in v ? "id" : "key";
          return v[dataKey] === filter.missingValue;
        }) : null;
        return missingOption ? [
          {
            label: missingLabel,
            key: filter.missingValue,
            value: filter.missingValue
          }
        ].concat(filter.options) : filter.options;
      }
      if (!(filtersBase == null ? void 0 : filtersBase[filter.name])) return [];
      const baseAgg = [...filtersBase[filter.name]];
      const aggregation = aggregations[filter.name];
      if (aggregation) {
        aggregation.forEach((entry) => {
          const dataKey = "id" in entry ? "id" : "key";
          const found = baseAgg.find((v) => v[dataKey] === entry[dataKey]);
          if (!found) baseAgg.push(entry);
        });
      }
      const labelKey = filter.labelKey || "key";
      return baseAgg.map((entry) => {
        const dataKey = "id" in entry ? "id" : "key";
        const labelValue = (0, import_get.default)(entry, labelKey);
        return {
          ...entry,
          label: labelValue === filter.missingValue ? missingLabel : (0, import_intl5.getLocaleValue)(labelValue, intl.locale),
          value: String(entry[dataKey])
        };
      });
    },
    [intl, aggregations, filtersBase]
  );
}

// src/hooks/useGetTotal.js
var import_react15 = require("react");
function useGetTotal(aggregations) {
  return (0, import_react15.useCallback)(
    (filter, option) => {
      const aggregation = aggregations[filter.name];
      if (!aggregation) return null;
      const dataKey = "id" in option ? "id" : "key";
      const optionKey = "id" in option ? "id" : "value";
      const optionValue = aggregation.find(
        (v) => String(v[dataKey]) === String(option[optionKey])
      );
      if (optionValue) {
        return optionValue.eventCount || 0;
      }
      return 0;
    },
    [aggregations]
  );
}

// src/hooks/useLoadGeoData.js
var import_react16 = require("react");
var import_qs2 = __toESM(require("qs"), 1);
function useLoadGeoData(_apiClient, res, queryOrFn, options = {}) {
  const { searchMethod = "get" } = options;
  return (0, import_react16.useCallback)(
    async (bounds, zoom) => {
      const query = typeof queryOrFn === "function" ? queryOrFn() : queryOrFn;
      const northEast = bounds.getNorthEast().wrap();
      const southWest = bounds.getSouthWest().wrap();
      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        aggregations: [
          {
            type: "geohash",
            size: 2e3,
            zoom: Math.max(zoom, 1),
            radius: zoom === 0 ? 80 : 40
          }
        ],
        geo: {
          northEast,
          southWest
        }
      };
      const result = await (searchMethod === "get" ? fetch(
        `${res}${getQuerySeparator(res)}${import_qs2.default.stringify(params, {
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
        throw new Error("Can't load geo data");
      });
      return result.aggregations.geohash;
    },
    [res, queryOrFn, searchMethod]
  );
}

// src/hooks/index.js
var import_react_final_form5 = require("react-final-form");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useActiveFilters,
  useChoiceState,
  useFavoriteState,
  useFavoritesOnChange,
  useField,
  useFilterTitle,
  useFilters,
  useForm,
  useGetFilterOptions,
  useGetTotal,
  useLoadGeoData,
  useLoadTimingsData
});
//# sourceMappingURL=index.cjs.map