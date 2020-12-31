import _ from 'lodash';
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DateRange, DefinedRange } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';
import { useIntl } from 'react-intl';
import { useLatest, usePrevious } from 'react-use';
import cn from 'classnames';

const defaultGetInitialValue = () => [
  {
    startDate: null,
    endDate: -1,
    key: 'selection',
  },
];

const rangeColors = ['#41acdd'];

function DateRangePicker({
  input,
  meta,
  staticRanges = [],
  inputRanges = [],
  disabled,
  ...otherProps
}) {
  const intl = useIntl();

  const dateRangeRef = useRef();

  const [ranges, setRanges] = useState(
    () => input.value ?? defaultGetInitialValue()
  );
  const [dragStatus, setDragStatus] = useState(false);
  const [focusedRange, setFocusedRange] = useState([0, 0]);

  const latestRanges = useLatest(ranges);
  const latestFocusedRange = useLatest(focusedRange);
  const previousValue = usePrevious(input.value);

  const { onChange } = input;

  // Update state for re-calculate rdrNoSelection
  const onSelectPreviewChange = useCallback(value => {
    const dateRange = dateRangeRef.current;

    setDragStatus(dateRangeRef.current?.calendar.state.drag.status);
    dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
  }, []);

  const onDefinedPreviewChange = useCallback(value => {
    const dateRange = dateRangeRef.current;

    return dateRange.updatePreview(
      value
        ? dateRange.calcNewSelection(value, typeof value === 'string')
        : null
    );
  }, []);

  const onTemporaryChange = useCallback(
    item => {
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
    [latestFocusedRange, onChange]
  );

  const onDefinedRangeChange = useCallback(
    item => {
      const value = [item?.selection ? item.selection : item.range1];

      setRanges(value);
      onChange(value);
    },
    [onChange]
  );

  const disabledDay = useCallback(() => disabled, [disabled]);

  const rdrNoSelection = useMemo(() => {
    const range = ranges?.[0];
    const hasRange = range && range.startDate !== null && range.endDate !== null;

    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);

  // If value change then update internal ranges
  useLayoutEffect(() => {
    if (
      !_.isEqual(input.value, previousValue)
      && !_.isEqual(input.value, latestRanges.current)
    ) {
      setRanges(input.value);
    }
  }, [input.value, previousValue, latestRanges]);

  const dateRangePickerProps = {
    showSelectionPreview: true,
    showMonthName: false,
    moveRangeOnFirstSelection: false,
    months: 1,
    ranges,
    direction: 'horizontal',
    locale: rdrLocales[intl.locale],
    staticRanges,
    inputRanges,
    focusedRange,
    onRangeFocusChange: setFocusedRange,
    rangeColors,
    ...otherProps,
  };

  return (
    <div className={cn('rdrDateRangePickerWrapper', { rdrNoSelection })}>
      <DateRange
        onPreviewChange={onSelectPreviewChange}
        onRangeFocusChange={setFocusedRange}
        {...dateRangePickerProps}
        onChange={onTemporaryChange}
        ref={dateRangeRef}
        className={undefined}
        disabledDay={disabledDay}
      />
      <DefinedRange
        onPreviewChange={onDefinedPreviewChange}
        {...dateRangePickerProps}
        range={ranges[focusedRange[0]]}
        onChange={onDefinedRangeChange}
        className={undefined}
      />
    </div>
  );
}

export default DateRangePicker;
