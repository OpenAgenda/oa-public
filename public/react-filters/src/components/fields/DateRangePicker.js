import _ from 'lodash';
import React, { useCallback, useMemo, useState, useContext } from 'react';
import { DateRange, DefinedRange } from 'react-date-range';
import { useIntl } from 'react-intl';
import { useIsomorphicLayoutEffect, useLatest, usePrevious } from 'react-use';
import cn from 'classnames';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import FiltersAndWidgetsContext from '../../contexts/FiltersAndWidgetsContext';

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

  return value.map(v => ({
    startDate: _.isDate(v.startDate) ? v.startDate.getTime() : v.startDate,
    endDate: _.isDate(v.endDate) ? v.endDate.getTime() : v.endDate,
    key: v.key,
  }));
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
    ...otherProps
  },
  ref,
) {
  const dateRangeRef = useConstant(() => ref || React.createRef());

  const { filtersOptions: { dateFnsLocale } } = useContext(FiltersAndWidgetsContext);

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
    value => {
      const dateRange = dateRangeRef.current;

      setDragStatus(dateRangeRef.current?.calendar.state.drag.status);
      dateRange.updatePreview(value ? dateRange.calcNewSelection(value) : null);
    },
    [dateRangeRef],
  );

  const onDefinedPreviewChange = useCallback(
    value => {
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
    [latestFocusedRange, onChange],
  );

  const onDefinedRangeChange = useCallback(
    item => {
      const value = [item?.selection ? item.selection : item.range1];

      setRanges(value);
      onChange(value);
    },
    [onChange],
  );

  const disabledDay = useCallback(() => disabled, [disabled]);

  const rdrNoSelection = useMemo(() => {
    const range = ranges?.[0];
    const hasRange = range && range.startDate !== null && range.endDate !== null;

    return !hasRange && !dragStatus;
  }, [ranges, dragStatus]);

  // If value change then update internal ranges
  useIsomorphicLayoutEffect(() => {
    if (
      previousValue
      && !_.isEqual(normalizeValue(input.value), normalizeValue(previousValue))
      && !_.isEqual(normalizeValue(input.value), normalizeValue(latestRanges.current))
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
    locale: dateFnsLocale,
    staticRanges,
    inputRanges,
    focusedRange,
    onRangeFocusChange: setFocusedRange,
    rangeColors: [rangeColor],
    ...otherProps,
  };

  return (
    <div className={cn('rdrDateRangePickerWrapper', className, { rdrNoSelection })}>
      <DateRange
        onPreviewChange={onSelectPreviewChange}
        onRangeFocusChange={setFocusedRange}
        {...dateRangePickerProps}
        onChange={onTemporaryChange}
        ref={dateRangeRef}
        className={undefined}
        disabledDay={disabledDay}
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
