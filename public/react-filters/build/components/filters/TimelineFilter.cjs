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

// src/components/filters/TimelineFilter.js
var TimelineFilter_exports = {};
__export(TimelineFilter_exports, {
  Preview: () => Preview,
  default: () => TimelineFilter_default,
  formatValue: () => formatValue
});
module.exports = __toCommonJS(TimelineFilter_exports);
var import_react7 = __toESM(require("react"), 1);
var import_react_intl5 = require("react-intl");
var import_react_final_form = require("react-final-form");
var import_date_fns2 = require("date-fns");
var import_date_fns_tz = require("date-fns-tz");

// src/hooks/useFilterTitle.js
var import_react = require("react");
var import_react_intl2 = require("react-intl");

// src/utils/getFilterTitle.js
var import_intl = require("@openagenda/intl");

// src/messages/filterTitles.js
var import_react_intl = require("react-intl");
var filterTitles_default = (0, import_react_intl.defineMessages)({
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
  const messages4 = providedMessages ?? filterTitles_default;
  if (fieldSchema == null ? void 0 : fieldSchema.label) {
    return (0, import_intl.getLocaleValue)(fieldSchema.label, intl.locale);
  }
  if (messages4[messageKey]) {
    return intl.formatMessage(messages4[messageKey]);
  }
  return messageKey;
}

// src/hooks/useFilterTitle.js
function useFilterTitle(messageKey, fieldSchema, messages4) {
  const intl = (0, import_react_intl2.useIntl)();
  return (0, import_react.useMemo)(
    () => getFilterTitle(intl, messages4, messageKey, fieldSchema),
    [intl, messages4, messageKey, fieldSchema]
  );
}

// src/components/ValueBadge.js
var import_classnames = __toESM(require("classnames"), 1);
var import_react_intl3 = require("react-intl");
var import_react2 = require("@emotion/react");
var import_intl2 = require("@openagenda/intl");
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl3.defineMessages)({
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
  const intl = (0, import_react_intl3.useIntl)();
  const titleLabel = (title == null ? void 0 : title.length) ? intl.formatMessage(messages.removeFilterWithTitle, { title }) : intl.formatMessage(messages.removeFilter);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      title: titleLabel,
      className: (0, import_classnames.default)("btn badge badge-pill badge-info margin-right-xs", {
        disabled
      }),
      css: import_react2.css`
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
        (0, import_intl2.getLocaleValue)(label, intl.locale),
        "\xA0",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "fa fa-times", "aria-hidden": "true" })
      ]
    }
  );
}

// src/components/FilterPreviewer.js
var import_jsx_runtime2 = require("@emotion/react/jsx-runtime");
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: valueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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

// src/components/fields/TimelineField.js
var import_react5 = __toESM(require("react"), 1);
var import_react_intl4 = require("react-intl");
var import_react6 = require("swiper/react");
var import_modules = require("swiper/modules");
var import_date_fns = require("date-fns");
var import_classnames2 = __toESM(require("classnames"), 1);
var import_en_US = __toESM(require("date-fns/locale/en-US/index.js"), 1);

// src/hooks/useLoadTimingsData.js
var import_react3 = require("react");
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
  return (0, import_react3.useCallback)(
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

// src/contexts/FiltersAndWidgetsContext.js
var import_react4 = require("react");
var FiltersAndWidgetsContext = (0, import_react4.createContext)({
  filters: [],
  widgets: [],
  setFilters: () => {
  },
  setWidgets: () => {
  },
  filtersOptions: {}
});
var FiltersAndWidgetsContext_default = FiltersAndWidgetsContext;

// src/components/fields/TimelineField.js
var import_jsx_runtime3 = require("@emotion/react/jsx-runtime");
var messages2 = (0, import_react_intl4.defineMessages)({
  selectMonth: {
    id: "ReactFilters.TimelineField.selectMonth",
    defaultMessage: "Select month"
  },
  selectDay: {
    id: "ReactFilters.TimelineField.selectDay",
    defaultMessage: "Select day"
  }
});
function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: (0, import_date_fns.startOfMonth)(focusedDate),
    lte: (0, import_date_fns.endOfMonth)(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
function formatMonthYear(date, dfnLocale) {
  const localeCode = (dfnLocale == null ? void 0 : dfnLocale.code) ?? void 0;
  return new Intl.DateTimeFormat(localeCode, {
    month: "long",
    year: "numeric"
  }).format(date);
}
function TimelineField({
  input,
  // meta,
  // disabled,
  className,
  // minDate,
  // maxDate,
  // shownDate,
  getQuery
  // ...otherProps
}, ref) {
  const intl = (0, import_react_intl4.useIntl)();
  const today = /* @__PURE__ */ new Date();
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react5.useContext)(FiltersAndWidgetsContext_default);
  const monthsList = (0, import_react5.useMemo)(
    () => Array.from({ length: 25 }, (_, i) => {
      const d = (0, import_date_fns.addMonths)(today, i - 12);
      return { month: d.getMonth(), year: d.getFullYear() };
    }),
    []
  );
  const [monthPos, setMonthPos] = (0, import_react5.useState)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) => m.month === firstDate.getMonth() && m.year === firstDate.getFullYear()
      );
    }
    return 12;
  });
  const { month: monthIndex, year } = monthsList[monthPos];
  const initialDay = (0, import_react5.useMemo)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      return new Date(input.value[0].startDate).getDate();
    }
    return today.getDate();
  }, [input.value]);
  const [focusedDay, setFocusedDay] = (0, import_react5.useState)(initialDay);
  const [data, setData] = (0, import_react5.useState)(() => null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  (0, import_react5.useEffect)(() => {
    loadTimingsData(
      {
        timings: focusedDateToTimingsQuery(new Date(year, monthIndex))
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    ).then((newData) => setData(newData ?? [])).catch((err) => {
      console.log("Failed to load timings data", err);
    });
  }, [year, monthIndex]);
  (0, import_react5.useImperativeHandle)(ref, () => ({
    onQueryChange: () => {
      loadTimingsData(
        {
          timings: focusedDateToTimingsQuery(new Date(year, monthIndex))
        },
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      ).then((newData) => setData(newData ?? [])).catch((err) => {
        console.log("Failed to load timings data", err);
      });
    }
  }));
  const getDaysArray = () => {
    if (monthIndex === null || year === null) return [];
    const nb = (0, import_date_fns.lastDayOfMonth)(new Date(year, monthIndex, 1)).getDate();
    return Array.from({ length: nb }, (_, i) => i + 1);
  };
  const toggleDay = (day) => {
    var _a;
    if (monthIndex === null || year === null) return;
    setFocusedDay(day);
    const dateObj = new Date(year, monthIndex, day);
    const current = Array.isArray(input.value) ? input.value : [];
    const next = current.some(({ startDate }) => (0, import_date_fns.isSameDay)(new Date(startDate), dateObj)) ? current.filter(
      ({ startDate }) => !(0, import_date_fns.isSameDay)(new Date(startDate), dateObj)
    ) : [
      ...current,
      {
        startDate: (0, import_date_fns.startOfDay)(dateObj).toISOString(),
        endDate: (0, import_date_fns.endOfDay)(dateObj).toISOString()
      }
    ];
    next.sort((a, b) => (0, import_date_fns.compareAsc)(new Date(a.startDate), new Date(b.startDate)));
    if ((_a = current[0]) == null ? void 0 : _a.tz) next[0].tz = current[0].tz;
    input.onChange(next);
  };
  const dayRefs = (0, import_react5.useRef)([]);
  const monthRefs = (0, import_react5.useRef)([]);
  const daysSwiper = (0, import_react5.useRef)(null);
  const monthsSwiper = (0, import_react5.useRef)(null);
  const handleSelectMonth = (pos) => setMonthPos(pos);
  const handleDayKey = (e, day, index) => {
    var _a, _b;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDay(day);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (index + 1) % 31;
      (_a = dayRefs.current[next]) == null ? void 0 : _a.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (index + 30) % 31;
      (_b = dayRefs.current[prev]) == null ? void 0 : _b.focus();
    }
  };
  const handleMonthKey = (e, pos) => {
    var _a, _b;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectMonth(pos);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      (_a = monthRefs.current[(pos + 1) % monthsList.length]) == null ? void 0 : _a.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      (_b = monthRefs.current[(pos + monthsList.length - 1) % monthsList.length]) == null ? void 0 : _b.focus();
    }
  };
  const days = getDaysArray();
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { ref, className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages2.selectMonth),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-months-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_react6.Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-months-prev",
                nextEl: ".oa-timeline-swiper-months-next"
              },
              modules: [import_modules.FreeMode, import_modules.Navigation],
              className: "oa-timeline-swiper-months",
              onSwiper: (sw) => {
                monthsSwiper.current = sw;
                sw.slideTo(monthPos, 0, false);
              },
              children: monthsList.map(({ month, year: monthYear }, pos) => {
                const isSelected = monthPos === pos;
                const isTabStop = isSelected || monthPos === null && pos === 0;
                return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    role: "option",
                    "aria-selected": isSelected,
                    ref: (el) => {
                      monthRefs.current[pos] = el;
                    },
                    tabIndex: isTabStop ? 0 : -1,
                    onClick: () => {
                      if (monthsSwiper.current && !monthsSwiper.current.allowClick) return;
                      handleSelectMonth(pos);
                    },
                    onKeyDown: (e) => handleMonthKey(e, pos),
                    children: monthYear !== today.getFullYear() ? formatMonthYear(
                      new Date(monthYear, month, 15),
                      dateFnsLocale
                    ) : (0, import_date_fns.format)(new Date(monthYear, month, 15), "MMMM", {
                      locale: dateFnsLocale || import_en_US.default
                    })
                  }
                ) }, `${monthYear}-${month}`);
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-months-next" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages2.selectDay),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-days-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_react6.Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-days-prev",
                nextEl: ".oa-timeline-swiper-days-next"
              },
              modules: [import_modules.FreeMode, import_modules.Navigation],
              className: "oa-timeline-swiper-days",
              onSwiper: (sw) => {
                daysSwiper.current = sw;
                sw.slideTo(initialDay - 1, 0);
              },
              children: days.map((day, idx) => {
                var _a;
                const dateObj = year !== null ? new Date(year, monthIndex, day) : null;
                const isChecked = dateObj ? (_a = input.value) == null ? void 0 : _a.some((d) => (0, import_date_fns.isSameDay)(d.startDate, dateObj)) : false;
                const isTabStop = focusedDay === day;
                const isActive = data == null ? void 0 : data.find(
                  (d) => (0, import_date_fns.isSameDay)(new Date(d.key), dateObj) && d.timingCount > 0
                );
                return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "span",
                  {
                    role: "option",
                    "aria-selected": isChecked,
                    ref: (el) => {
                      dayRefs.current[idx] = el;
                    },
                    tabIndex: isTabStop ? 0 : -1,
                    onClick: () => {
                      if (daysSwiper.current && !daysSwiper.current.allowClick) return;
                      toggleDay(day);
                    },
                    onKeyDown: (e) => handleDayKey(e, day, idx),
                    className: (0, import_classnames2.default)("oa-timeline-swiper-days-day", {
                      "oa-timeline-swiper-days-day-with-timings": data && isActive,
                      "oa-timeline-swiper-days-day-without-timings": data && !isActive
                    }),
                    children: day
                  }
                ) }, day);
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-days-next" })
        ]
      }
    )
  ] });
}
var TimelineField_default = import_react5.default.forwardRef(TimelineField);

// src/components/filters/TimelineFilter.js
var import_jsx_runtime4 = require("@emotion/react/jsx-runtime");
var messages3 = (0, import_react_intl5.defineMessages)({
  dateRange: {
    id: "ReactFilters.TimelineFilter.dateRange",
    defaultMessage: "From {startDate} to {endDate}"
  },
  until: {
    id: "ReactFilters.TimelineFilter.until",
    defaultMessage: "Until {date}"
  },
  from: {
    id: "ReactFilters.TimelineFilter.from",
    defaultMessage: "From {date}"
  }
});
var subscription = { value: true };
function formatDateValue(value) {
  if (!value || value === "") {
    return null;
  }
  return typeof value === "string" ? (0, import_date_fns2.parseISO)(value) : value;
}
function formatValue(value) {
  if (!value || !Array.isArray(value)) {
    return [];
  }
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzFromStore = value[0].tz ?? currentTz;
  return value.map(({ gte, lte }) => {
    const start = formatDateValue(gte);
    const end = formatDateValue(lte);
    const tzDiff = (0, import_date_fns_tz.getTimezoneOffset)(tzFromStore, start ?? end ?? /* @__PURE__ */ new Date()) - (0, import_date_fns_tz.getTimezoneOffset)(currentTz, start ?? end ?? /* @__PURE__ */ new Date());
    const convert = (d) => tzDiff && d ? (0, import_date_fns_tz.utcToZonedTime)(d, tzFromStore) : d;
    return {
      startDate: convert(start),
      endDate: convert(end)
    };
  });
}
function parseValue(value) {
  if (!value.length) {
    return void 0;
  }
  const toStoreObj = ({ startDate, endDate }) => {
    const start = formatDateValue(startDate);
    const end = endDate ? (0, import_date_fns2.endOfDay)(formatDateValue(endDate)) : null;
    return { gte: start, lte: end };
  };
  const result = value.map(toStoreObj);
  if (result.length) {
    result[0].tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return result.length ? result : void 0;
}
function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = (0, import_react_intl5.useIntl)();
  const { input } = (0, import_react_final_form.useField)(name, { subscription });
  const ranges = formatValue(input.value);
  const firstRange = ranges[0];
  const lastRange = ranges[ranges.length - 1];
  const begin = firstRange.startDate;
  const end = lastRange.endDate;
  const singleDay = begin && end && (0, import_date_fns2.isSameDay)(begin, end);
  const onRemove = (0, import_react7.useCallback)(
    (e) => {
      e.stopPropagation();
      if (!disabled) input.onChange(void 0);
    },
    [input, disabled]
  );
  const fmt = (d) => intl.formatDate(d);
  if (!ranges.length) return null;
  let label;
  if (!begin && !end) return null;
  if (begin && !end) {
    label = intl.formatMessage(messages3.from, { date: fmt(begin) });
  } else if (!begin && end) {
    label = intl.formatMessage(messages3.until, { date: fmt(end) });
  } else {
    label = singleDay ? fmt(begin) : intl.formatMessage(messages3.dateRange, {
      startDate: fmt(begin),
      endDate: fmt(end)
    });
  }
  return import_react7.default.createElement(component, {
    name,
    label,
    onRemove,
    disabled,
    ...rest
  });
}
var TimelineFilter = import_react7.default.forwardRef(function TimelineFilter2({ name, className, minDate, maxDate, shownDate, getQuery }, ref) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    import_react_final_form.Field,
    {
      ref,
      name,
      subscription,
      parse: parseValue,
      format: formatValue,
      component: TimelineField_default,
      className,
      minDate,
      maxDate,
      shownDate,
      getQuery
    }
  );
});
var exported = import_react7.default.memo(TimelineFilter);
exported.Preview = Preview;
var TimelineFilter_default = exported;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Preview,
  formatValue
});
//# sourceMappingURL=TimelineFilter.cjs.map