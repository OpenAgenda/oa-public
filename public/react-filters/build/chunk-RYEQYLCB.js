import {
  useLoadTimingsData
} from "./chunk-I3FR6BV2.js";
import {
  FiltersAndWidgetsContext_default
} from "./chunk-KG7QE6MN.js";

// src/components/fields/TimelineField.js
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useContext
} from "react";
import { defineMessages, useIntl } from "react-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  lastDayOfMonth,
  addMonths,
  isSameDay,
  compareAsc,
  format
} from "date-fns";
import cn from "classnames";
import dateFnsLocaleEN from "date-fns/locale/en-US/index.js";
import { jsx, jsxs } from "@emotion/react/jsx-runtime";
var messages = defineMessages({
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
    gte: startOfMonth(focusedDate),
    lte: endOfMonth(focusedDate),
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
  const intl = useIntl();
  const today = /* @__PURE__ */ new Date();
  const {
    filtersOptions: { dateFnsLocale, searchMethod, res }
  } = useContext(FiltersAndWidgetsContext_default);
  const monthsList = useMemo(
    () => Array.from({ length: 25 }, (_, i) => {
      const d = addMonths(today, i - 12);
      return { month: d.getMonth(), year: d.getFullYear() };
    }),
    []
  );
  const [monthPos, setMonthPos] = useState(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) => m.month === firstDate.getMonth() && m.year === firstDate.getFullYear()
      );
    }
    return 12;
  });
  const { month: monthIndex, year } = monthsList[monthPos];
  const initialDay = useMemo(() => {
    if (Array.isArray(input.value) && input.value.length) {
      return new Date(input.value[0].startDate).getDate();
    }
    return today.getDate();
  }, [input.value]);
  const [focusedDay, setFocusedDay] = useState(initialDay);
  const [data, setData] = useState(() => null);
  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });
  useEffect(() => {
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
  useImperativeHandle(ref, () => ({
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
    const nb = lastDayOfMonth(new Date(year, monthIndex, 1)).getDate();
    return Array.from({ length: nb }, (_, i) => i + 1);
  };
  const toggleDay = (day) => {
    var _a;
    if (monthIndex === null || year === null) return;
    setFocusedDay(day);
    const dateObj = new Date(year, monthIndex, day);
    const current = Array.isArray(input.value) ? input.value : [];
    const next = current.some(({ startDate }) => isSameDay(new Date(startDate), dateObj)) ? current.filter(
      ({ startDate }) => !isSameDay(new Date(startDate), dateObj)
    ) : [
      ...current,
      {
        startDate: startOfDay(dateObj).toISOString(),
        endDate: endOfDay(dateObj).toISOString()
      }
    ];
    next.sort((a, b) => compareAsc(new Date(a.startDate), new Date(b.startDate)));
    if ((_a = current[0]) == null ? void 0 : _a.tz) next[0].tz = current[0].tz;
    input.onChange(next);
  };
  const dayRefs = useRef([]);
  const monthRefs = useRef([]);
  const daysSwiper = useRef(null);
  const monthsSwiper = useRef(null);
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
  return /* @__PURE__ */ jsxs("div", { ref, className, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages.selectMonth),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "swiper-button-prev oa-timeline-swiper-months-prev" }),
          /* @__PURE__ */ jsx(
            Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-months-prev",
                nextEl: ".oa-timeline-swiper-months-next"
              },
              modules: [FreeMode, Navigation],
              className: "oa-timeline-swiper-months",
              onSwiper: (sw) => {
                monthsSwiper.current = sw;
                sw.slideTo(monthPos, 0, false);
              },
              children: monthsList.map(({ month, year: monthYear }, pos) => {
                const isSelected = monthPos === pos;
                const isTabStop = isSelected || monthPos === null && pos === 0;
                return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(
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
                    ) : format(new Date(monthYear, month, 15), "MMMM", {
                      locale: dateFnsLocale || dateFnsLocaleEN
                    })
                  }
                ) }, `${monthYear}-${month}`);
              })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "swiper-button-next oa-timeline-swiper-months-next" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        role: "listbox",
        "aria-label": intl.formatMessage(messages.selectDay),
        style: { display: "flex" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "swiper-button-prev oa-timeline-swiper-days-prev" }),
          /* @__PURE__ */ jsx(
            Swiper,
            {
              slidesPerView: "auto",
              centeredSlides: true,
              centeredSlidesBounds: true,
              freeMode: true,
              navigation: {
                prevEl: ".oa-timeline-swiper-days-prev",
                nextEl: ".oa-timeline-swiper-days-next"
              },
              modules: [FreeMode, Navigation],
              className: "oa-timeline-swiper-days",
              onSwiper: (sw) => {
                daysSwiper.current = sw;
                sw.slideTo(initialDay - 1, 0);
              },
              children: days.map((day, idx) => {
                var _a;
                const dateObj = year !== null ? new Date(year, monthIndex, day) : null;
                const isChecked = dateObj ? (_a = input.value) == null ? void 0 : _a.some((d) => isSameDay(d.startDate, dateObj)) : false;
                const isTabStop = focusedDay === day;
                const isActive = data == null ? void 0 : data.find(
                  (d) => isSameDay(new Date(d.key), dateObj) && d.timingCount > 0
                );
                return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(
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
                    className: cn("oa-timeline-swiper-days-day", {
                      "oa-timeline-swiper-days-day-with-timings": data && isActive,
                      "oa-timeline-swiper-days-day-without-timings": data && !isActive
                    }),
                    children: day
                  }
                ) }, day);
              })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "swiper-button-next oa-timeline-swiper-days-next" })
        ]
      }
    )
  ] });
}
var TimelineField_default = React.forwardRef(TimelineField);

export {
  TimelineField_default
};
//# sourceMappingURL=chunk-RYEQYLCB.js.map