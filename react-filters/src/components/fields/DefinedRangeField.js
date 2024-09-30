import isEqual from 'lodash/isEqual';
import isDate from 'lodash/isDate';
import React, { useCallback, useState } from 'react';
import { DefinedRange } from '@openagenda/react-date-range';
import { useIsomorphicLayoutEffect, useLatest, usePrevious } from 'react-use';

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

function DefinedRangeField(
  {
    input,
    meta,
    staticRanges = [],
    inputRanges = [],
    rangeColor = '#41acdd',
    disabled,
    ...otherProps
  },
  _ref,
) {
  const [ranges, setRanges] = useState(
    () => input.value ?? defaultGetInitialValue(),
  );

  const latestRanges = useLatest(ranges);
  const previousValue = usePrevious(input.value);

  const { onChange } = input;

  const onDefinedRangeChange = useCallback(
    (item) => {
      const value = [item?.selection ? item.selection : item.range1];

      setRanges(value);
      onChange(value);
    },
    [onChange],
  );

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
  }, [input.value, previousValue, latestRanges]);

  const definedRangePickerProps = {
    ranges,
    staticRanges,
    inputRanges,
    rangeColors: [rangeColor],
    ...otherProps,
  };

  return (
    <div className="rdrDateRangePickerWrapper">
      <DefinedRange
        {...definedRangePickerProps}
        onChange={onDefinedRangeChange}
        className={undefined}
      />
    </div>
  );
}

export default React.forwardRef(DefinedRangeField);
