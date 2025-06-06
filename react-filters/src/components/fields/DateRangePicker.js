import isEqual from 'lodash/isEqual.js';
import isDate from 'lodash/isDate.js';
import React, {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react';
import { useIntl } from 'react-intl';
import useIsomorphicLayoutEffectModule from 'react-use/lib/useIsomorphicLayoutEffect.js';
import useLatestModule from 'react-use/lib/useLatest.js';
import usePreviousModule from 'react-use/lib/usePrevious.js';
import cn from 'classnames';
import { startOfMonth, endOfMonth, isSameDay, format } from 'date-fns';
import dateFnsLocaleEN from 'date-fns/locale/en-US/index.js';
import { DateRange, DefinedRange } from '@openagenda/react-date-range';
import { getFallbackChain } from '@openagenda/intl';
import FiltersAndWidgetsContext from '../../contexts/FiltersAndWidgetsContext.js';
import convertPhpDateFormatToDateFns from '../../utils/convertPhpDateFormatToDateFns.js';
import useLoadTimingsData from '../../hooks/useLoadTimingsData.js';

const useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;
const useLatest = useLatestModule.default || useLatestModule;
const usePrevious = usePreviousModule.default || usePreviousModule;

const dateDisplayFormats = {
  en: 'MMM d, yyyy', // Jan 1, 2024
  fr: 'd MMM yyyy', // 1 janv. 2024
  de: 'd. MMM yyyy', // 1. Jan. 2024
  it: 'd MMM yyyy', // 1 gen 2024
  es: 'd MMM yyyy', // 1 ene 2024
};

const defaultGetInitialValue = () => [
  {
    startDate: null,
    endDate: -1,
    key: 'selection',
  },
];

function normalizeValue(value) {
  if (!value?.length) {
    return value;
  }

  return value.map((v) => ({
    startDate: isDate(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: isDate(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key,
  }));
}

function getDateDisplayFormat(dateFormatStyle, dateFormat, locale) {
  if (dateFormat) {
    return dateFormatStyle === 'php'
      ? convertPhpDateFormatToDateFns(dateFormat)
      : dateFormat;
  }

  const fallbackChain = getFallbackChain(locale);

  for (const fallback of fallbackChain) {
    if (dateDisplayFormats[fallback]) {
      return dateDisplayFormats[fallback];
    }
  }

  return dateDisplayFormats[Object.keys(dateDisplayFormats).shift()];
}

function focusedDateToTimingsQuery(focusedDate) {
  return {
    gte: startOfMonth(focusedDate),
    lte: endOfMonth(focusedDate),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function DateRangePicker(
  {
    input,
    meta,
    staticRanges = [],
    inputRanges = [],
    rangeColor = '#41acdd',
    disabled,
    className,
    dateFormatStyle,
    dateFormat,
    minDate,
    maxDate,
    shownDate,
    getQuery,
    ...otherProps
  },
  ref,
) {
  const intl = useIntl();

  const dateRangeRef = useRef(null);

  const [data, setData] = useState(() => []);

  const {
    filtersOptions: { dateFnsLocale, searchMethod, res },
  } = useContext(FiltersAndWidgetsContext);

  const [ranges, setRanges] = useState(
    () => input.value ?? defaultGetInitialValue(),
  );
  const [dragStatus, setDragStatus] = useState(false);
  const [focusedRange, setFocusedRange] = useState([0, 0]);

  const latestRanges = useLatest(ranges);
  const latestFocusedRange = useLatest(focusedRange);
  const previousValue = usePrevious(input.value);

  const { onChange } = input;

  // Update state for re-calculate rdrNoSelection
  const onSelectPreviewChange = useCallback(
    (value) => {
      const dateRange = dateRangeRef.current;

      setDragStatus(dateRangeRef.current?.calendar.state.drag.status);
      dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
    },
    [dateRangeRef],
  );

  const onDefinedPreviewChange = useCallback(
    (value) => {
      const dateRange = dateRangeRef.current;

      return dateRange.updatePreview(
        value
          ? dateRange.calcNewSelection(value, typeof value === 'string')
          : null,
      );
    },
    [dateRangeRef],
  );

  const onTemporaryChange = useCallback(
    (item) => {
      const value = [item?.selection ? item.selection : item.range1];

      setRanges(value);

      if (
        latestFocusedRange.current[0] === 0
        && latestFocusedRange.current[1] === 0
        && value[0].startDate.getTime() !== value[0].endDate.getTime()
      ) {
        onChange(value);
      }

      if (
        latestFocusedRange.current[0] === 0
        && latestFocusedRange.current[1] === 1
      ) {
        onChange(value);
      }
    },
    [latestFocusedRange, onChange],
  );

  const onDefinedRangeChange = useCallback(
    (item) => {
      const value = [item?.selection ? item.selection : item.range1];

      setRanges(value);
      onChange(value);
    },
    [onChange],
  );

  const disabledDay = useCallback(() => disabled, [disabled]);

  const rdrNoSelection = useMemo(() => {
    const range = ranges?.[0];
    const hasRange = range && range.endDate !== null;

    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);

  const [focusedDate, setFocusedDate] = useState(null);

  const loadTimingsData = useLoadTimingsData(res, getQuery, { searchMethod });

  // If value change then update internal ranges
  useIsomorphicLayoutEffect(() => {
    if (
      previousValue
      && !isEqual(normalizeValue(input.value), normalizeValue(previousValue))
      && !isEqual(
        normalizeValue(input.value),
        normalizeValue(latestRanges.current),
      )
    ) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges, dateRangeRef, shownDate]);

  const onShownDateChange = async (newFocusedDate) => {
    if (input.name !== 'timings') {
      return;
    }

    setFocusedDate(newFocusedDate);
  };

  // set focusedDate from calendar state
  useIsomorphicLayoutEffect(() => {
    if (input.name !== 'timings' || !dateRangeRef.current) {
      return;
    }

    const newFocused = dateRangeRef.current.calendar?.state?.focusedDate;

    if (focusedDate !== newFocused) {
      setFocusedDate(newFocused);
    }
  }, [dateRangeRef, focusedDate, input.name]);

  useEffect(() => {
    if (!focusedDate) {
      return;
    }

    loadTimingsData(
      {
        timings: focusedDateToTimingsQuery(focusedDate),
      },
      {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    )
      .then((newData) => setData(newData ?? []))
      .catch((err) => {
        console.log('Failed to load timings data', err);
      });
  }, [focusedDate]);

  useImperativeHandle(ref, () => ({
    onQueryChange: () => {
      if (focusedDate !== dateRangeRef.current.calendar?.state?.focusedDate) {
        // will trigger the effect with loadTimingsData
        setFocusedDate(dateRangeRef.current.calendar?.state?.focusedDate);
      } else {
        // same date but query can be changed
        loadTimingsData(
          {
            timings: focusedDateToTimingsQuery(
              dateRangeRef.current.calendar?.state?.focusedDate,
            ),
          },
          {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        )
          .then((newData) => setData(newData ?? []))
          .catch((err) => {
            console.log('Failed to load timings data', err);
          });
      }
    },
  }));

  const dayContentRenderer = useCallback(
    (day) => {
      const isActive = data.find(
        (d) => isSameDay(new Date(d.key), day) && d.timingCount > 0,
      );
      return (
        <span
          className={isActive ? 'rdrDayWithTimings' : 'rdrDayWithoutTimings'}
        >
          {format(day, 'd')}
        </span>
      );
    },
    [data],
  );

  const dateRangePickerProps = {
    showSelectionPreview: true,
    showMonthName: false,
    moveRangeOnFirstSelection: false,
    months: 1,
    ranges,
    direction: 'horizontal',
    locale: dateFnsLocale || dateFnsLocaleEN,
    staticRanges,
    inputRanges,
    focusedRange,
    onRangeFocusChange: setFocusedRange,
    rangeColors: [rangeColor],
    minDate: minDate ? new Date(minDate) : undefined,
    maxDate: maxDate ? new Date(maxDate) : undefined,
    shownDate: shownDate ? new Date(shownDate) : undefined,
    onShownDateChange,
    dayContentRenderer,
    ...otherProps,
  };

  return (
    <div
      className={cn('rdrDateRangePickerWrapper', className, { rdrNoSelection })}
    >
      <DateRange
        onPreviewChange={onSelectPreviewChange}
        onRangeFocusChange={setFocusedRange}
        {...dateRangePickerProps}
        onChange={onTemporaryChange}
        ref={dateRangeRef}
        className={undefined}
        disabledDay={disabledDay}
        dateDisplayFormat={getDateDisplayFormat(
          dateFormatStyle,
          dateFormat,
          intl.locale,
        )}
      />
      {staticRanges.length ? (
        <DefinedRange
          onPreviewChange={onDefinedPreviewChange}
          {...dateRangePickerProps}
          range={ranges[focusedRange[0]]}
          onChange={onDefinedRangeChange}
          className={undefined}
        />
      ) : null}
    </div>
  );
}

export default React.forwardRef(DateRangePicker);
