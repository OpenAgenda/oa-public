import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useImperativeHandle,
  useContext,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  lastDayOfMonth,
  addMonths,
  isSameDay,
  compareAsc,
  format,
} from 'date-fns';
import cn from 'classnames';
import dateFnsLocaleEN from 'date-fns/locale/en-US/index.js';
import useLoadTimingsData from '../../hooks/useLoadTimingsData.js';
import FiltersAndWidgetsContext from '../../contexts/FiltersAndWidgetsContext.js';

const messages = defineMessages({
  selectMonth: {
    id: 'ReactFilters.TimelineField.selectMonth',
    defaultMessage: 'Select month',
  },
  selectDay: {
    id: 'ReactFilters.TimelineField.selectDay',
    defaultMessage: 'Select day',
  },
  wholeMonth: {
    id: 'ReactFilters.TimelineField.wholeMonth',
    defaultMessage: 'Whole month',
  },
});

function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: startOfMonth(focusedDate),
    lte: endOfMonth(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function formatMonthYear(date, dfnLocale) {
  const localeCode = dfnLocale?.code ?? undefined;

  return new Intl.DateTimeFormat(localeCode, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function TimelineField(
  {
    input,
    // meta,
    // disabled,
    className,
    // minDate,
    // maxDate,
    // shownDate,
    getQuery,
    // ...otherProps
  },
  ref,
) {
  const intl = useIntl();

  const today = new Date();

  const {
    filtersOptions: { dateFnsLocale, searchMethod, res },
  } = useContext(FiltersAndWidgetsContext);

  const monthsList = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => {
        const d = addMonths(today, i - 12);
        return { month: d.getMonth(), year: d.getFullYear() };
      }),
    [],
  );

  const [monthPos, setMonthPos] = useState(() => {
    if (Array.isArray(input.value) && input.value.length) {
      const firstDate = new Date(input.value[0].startDate);
      return monthsList.findIndex(
        (m) =>
          m.month === firstDate.getMonth()
          && m.year === firstDate.getFullYear(),
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
        timings: focusedDateToTimingsQuery(new Date(year, monthIndex)),
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    )
      .then((newData) => setData(newData ?? []))
      .catch((err) => {
        console.log('Failed to load timings data', err);
      });
  }, [year, monthIndex]);

  useImperativeHandle(ref, () => ({
    onQueryChange: () => {
      loadTimingsData(
        {
          timings: focusedDateToTimingsQuery(new Date(year, monthIndex)),
        },
        {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      )
        .then((newData) => setData(newData ?? []))
        .catch((err) => {
          console.log('Failed to load timings data', err);
        });
    },
  }));

  // date composition
  const getDaysArray = () => {
    if (monthIndex === null || year === null) return [];
    const nb = lastDayOfMonth(new Date(year, monthIndex, 1)).getDate();
    return Array.from({ length: nb }, (_, i) => i + 1);
  };

  const toggleDay = (day) => {
    if (monthIndex === null || year === null) return;
    setFocusedDay(day);

    const dateObj = new Date(year, monthIndex, day);
    const current = Array.isArray(input.value) ? input.value : [];

    const next = current.some(({ startDate }) =>
      isSameDay(new Date(startDate), dateObj))
      ? current.filter(
        ({ startDate }) => !isSameDay(new Date(startDate), dateObj),
      )
      : [
        ...current,
        {
          startDate: startOfDay(dateObj).toISOString(),
          endDate: endOfDay(dateObj).toISOString(),
        },
      ];

    next.sort((a, b) =>
      compareAsc(new Date(a.startDate), new Date(b.startDate)));
    if (current[0]?.tz) next[0].tz = current[0].tz;

    input.onChange(next);
  };

  const areAllDaysSelected = useMemo(() => {
    if (monthIndex === null || year === null) return false;
    const nb = lastDayOfMonth(new Date(year, monthIndex, 1)).getDate();
    if (nb === 0) return false;
    const current = Array.isArray(input.value) ? input.value : [];
    for (let d = 1; d <= nb; d += 1) {
      const dateObj = new Date(year, monthIndex, d);
      if (
        !current.some(({ startDate }) =>
          isSameDay(new Date(startDate), dateObj))
      ) {
        return false;
      }
    }
    return true;
  }, [input.value, monthIndex, year]);

  const toggleWholeMonth = () => {
    if (monthIndex === null || year === null) return;

    const nb = lastDayOfMonth(new Date(year, monthIndex, 1)).getDate();
    const monthDates = Array.from(
      { length: nb },
      (_, i) => new Date(year, monthIndex, i + 1),
    );
    const current = Array.isArray(input.value) ? input.value : [];

    const allSelected = monthDates.every((dateObj) =>
      current.some(({ startDate }) => isSameDay(new Date(startDate), dateObj)));

    let next;
    if (allSelected) {
      // remove all days of month
      next = current.filter(
        ({ startDate }) =>
          !monthDates.some((dateObj) =>
            isSameDay(new Date(startDate), dateObj)),
      );
    } else {
      // add missing days of month
      const toAdd = monthDates
        .filter(
          (dateObj) =>
            !current.some(({ startDate }) =>
              isSameDay(new Date(startDate), dateObj)),
        )
        .map((dateObj) => ({
          startDate: startOfDay(dateObj).toISOString(),
          endDate: endOfDay(dateObj).toISOString(),
        }));
      next = [...current, ...toAdd];
      next.sort((a, b) =>
        compareAsc(new Date(a.startDate), new Date(b.startDate)));
    }

    if (current[0]?.tz && next.length) next[0].tz = current[0].tz;
    input.onChange(next);
  };

  const dayRefs = useRef([]);
  const monthRefs = useRef([]);
  const allMonthRef = useRef(null);

  const daysSwiper = useRef(null);
  const monthsSwiper = useRef(null);

  const handleSelectMonth = (pos) => setMonthPos(pos);

  const handleDayKey = (e, day, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDay(day);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + 1) % 31;
      dayRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (index + 30) % 31;
      dayRefs.current[prev]?.focus();
    }
  };

  const handleAllMonthKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleWholeMonth();
    }
  };

  const handleMonthKey = (e, pos) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectMonth(pos);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      monthRefs.current[(pos + 1) % monthsList.length]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      monthRefs.current[
        (pos + monthsList.length - 1) % monthsList.length
      ]?.focus();
    }
  };

  const days = getDaysArray();

  return (
    <div ref={ref} className={className}>
      <div
        role="listbox"
        aria-label={intl.formatMessage(messages.selectMonth)}
        style={{ display: 'flex' }}
      >
        <div className="swiper-button-prev oa-timeline-swiper-months-prev" />
        <Swiper
          slidesPerView="auto"
          centeredSlides
          centeredSlidesBounds
          freeMode
          navigation={{
            prevEl: '.oa-timeline-swiper-months-prev',
            nextEl: '.oa-timeline-swiper-months-next',
          }}
          modules={[FreeMode, Navigation]}
          className="oa-timeline-swiper-months"
          onSwiper={(sw) => {
            monthsSwiper.current = sw;
            sw.slideTo(monthPos, 0, false);
          }}
        >
          {monthsList.map(({ month, year: monthYear }, pos) => {
            const isSelected = monthPos === pos;
            const isTabStop = isSelected || (monthPos === null && pos === 0);

            return (
              <SwiperSlide key={`${monthYear}-${month}`}>
                <span
                  role="option"
                  aria-selected={isSelected}
                  ref={(el) => {
                    monthRefs.current[pos] = el;
                  }}
                  tabIndex={isTabStop ? 0 : -1}
                  onClick={() => {
                    if (
                      monthsSwiper.current
                      && !monthsSwiper.current.allowClick
                    ) return;
                    handleSelectMonth(pos);
                  }}
                  onKeyDown={(e) => handleMonthKey(e, pos)}
                >
                  {monthYear !== today.getFullYear()
                    ? formatMonthYear(
                      new Date(monthYear, month, 15),
                      dateFnsLocale,
                    )
                    : format(new Date(monthYear, month, 15), 'MMMM', {
                      locale: dateFnsLocale || dateFnsLocaleEN,
                    })}
                </span>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="swiper-button-next oa-timeline-swiper-months-next" />
      </div>

      <div
        role="listbox"
        aria-label={intl.formatMessage(messages.selectDay)}
        style={{ display: 'flex' }}
      >
        <div className="swiper-button-prev oa-timeline-swiper-days-prev" />

        <Swiper
          slidesPerView="auto"
          centeredSlides
          centeredSlidesBounds
          // loop
          freeMode
          navigation={{
            prevEl: '.oa-timeline-swiper-days-prev',
            nextEl: '.oa-timeline-swiper-days-next',
          }}
          modules={[FreeMode, Navigation]}
          className="oa-timeline-swiper-days"
          onSwiper={(sw) => {
            daysSwiper.current = sw;
            sw.slideTo(initialDay, 0);
          }}
        >
          <SwiperSlide key="__all__">
            <span
              role="option"
              aria-selected={areAllDaysSelected}
              ref={allMonthRef}
              tabIndex={0}
              onClick={() => {
                if (daysSwiper.current && !daysSwiper.current.allowClick) return;
                toggleWholeMonth();
              }}
              onKeyDown={handleAllMonthKey}
              className={cn(
                'oa-timeline-swiper-days-day',
                'oa-timeline-swiper-days-all',
                {
                  'is-selected': areAllDaysSelected,
                },
              )}
            >
              {intl.formatMessage(messages.wholeMonth)}
            </span>
          </SwiperSlide>

          {days.map((day, idx) => {
            const dateObj = year !== null ? new Date(year, monthIndex, day) : null;
            const isChecked = dateObj
              ? (Array.isArray(input.value) ? input.value : []).some((d) =>
                isSameDay(new Date(d.startDate), dateObj))
              : false;
            const isTabStop = focusedDay === day;

            const isActive = data?.find(
              (d) => isSameDay(new Date(d.key), dateObj) && d.timingCount > 0,
            );

            return (
              <SwiperSlide key={day}>
                <span
                  role="option"
                  aria-selected={isChecked}
                  ref={(el) => {
                    dayRefs.current[idx] = el;
                  }}
                  tabIndex={isTabStop ? 0 : -1}
                  onClick={() => {
                    if (daysSwiper.current && !daysSwiper.current.allowClick) return;
                    toggleDay(day);
                  }}
                  onKeyDown={(e) => handleDayKey(e, day, idx)}
                  className={cn('oa-timeline-swiper-days-day', {
                    'oa-timeline-swiper-days-day-with-timings':
                      data && isActive,
                    'oa-timeline-swiper-days-day-without-timings':
                      data && !isActive,
                  })}
                >
                  {day}
                </span>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="swiper-button-next oa-timeline-swiper-days-next" />
      </div>
    </div>
  );
}

export default React.forwardRef(TimelineField);
