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

// src/components/fields/TimelineField.js
var TimelineField_exports = {};
__export(TimelineField_exports, {
  default: () => TimelineField_default
});
module.exports = __toCommonJS(TimelineField_exports);
var import_react3 = __toESM(require("react"), 1);
var import_react_intl = require("react-intl");
var import_react4 = require("swiper/react");
var import_modules = require("swiper/modules");
var import_date_fns = require("date-fns");
var import_classnames = __toESM(require("classnames"), 1);
var import_en_US = __toESM(require("date-fns/locale/en-US/index.js"), 1);

// src/hooks/useLoadTimingsData.js
var import_react = require("react");
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
  return (0, import_react.useCallback)(
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
var import_react2 = require("react");
var FiltersAndWidgetsContext = (0, import_react2.createContext)({
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
var import_jsx_runtime = require("@emotion/react/jsx-runtime");
var messages = (0, import_react_intl.defineMessages)({
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
  const intl = (0, import_react_intl.useIntl)();
  const today = /* @__PURE__ */ new Date();
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = (0, import_react3.useContext)(FiltersAndWidgetsContext_default);
  const monthsList = (0, import_react3.useMemo)(
    () => Array.from({ length: 25 }, (_, i) => {
      const d = (0, import_date_fns.addMonths)(today, i - 12);
      return { month: d.getMonth(), year: d.getFullYear() };
    }),
    []
  );
  const [monthPos, setMonthPos] = (0, import_react3.useState)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) => m.month === firstDate.getMonth() && m.year === firstDate.getFullYear()
      );
    }
    return 12;
  });
  const { month: monthIndex, year } = monthsList[monthPos];
  const initialDay = (0, import_react3.useMemo)(() => {
    if (Array.isArray(input.value) && input.value.length) {
      return new Date(input.value[0].startDate).getDate();
    }
    return today.getDate();
  }, [input.value]);
  const [focusedDay, setFocusedDay] = (0, import_react3.useState)(initialDay);
  const [data, setData] = (0, import_react3.useState)(() => null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  (0, import_react3.useEffect)(() => {
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
  (0, import_react3.useImperativeHandle)(ref, () => ({
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
  const dayRefs = (0, import_react3.useRef)([]);
  const monthRefs = (0, import_react3.useRef)([]);
  const daysSwiper = (0, import_react3.useRef)(null);
  const monthsSwiper = (0, import_react3.useRef)(null);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref, className, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages.selectMonth),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-months-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_react4.Swiper,
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
                return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react4.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-months-next" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages.selectDay),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "swiper-button-prev oa-timeline-swiper-days-prev" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_react4.Swiper,
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
                return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react4.SwiperSlide, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
                    className: (0, import_classnames.default)("oa-timeline-swiper-days-day", {
                      "oa-timeline-swiper-days-day-with-timings": data && isActive,
                      "oa-timeline-swiper-days-day-without-timings": data && !isActive
                    }),
                    children: day
                  }
                ) }, day);
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "swiper-button-next oa-timeline-swiper-days-next" })
        ]
      }
    )
  ] });
}
var TimelineField_default = import_react3.default.forwardRef(TimelineField);
//# sourceMappingURL=TimelineField.cjs.map