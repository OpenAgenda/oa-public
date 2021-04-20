import { useUIDSeed } from 'react-uid';
import React, { useMemo } from 'react';
import cn from 'classnames';
import { getLocaleValue } from '@openagenda/react-shared';

export default function Checkbox({
  input,
  getTotal,
  filter,
  option,
  disabled,
}) {
  const seed = useUIDSeed();
  const total = useMemo(() => getTotal && getTotal(filter, option), [
    filter,
    getTotal,
    option,
  ]);

  return (
    <div className={cn('checkbox', { disabled })}>
      <label htmlFor={seed(input)}>
        <input
          type="checkbox"
          id={seed(input)}
          disabled={disabled}
          {...input}
        />{' '}
        {getLocaleValue(option.label)}
        {Number.isInteger(total) ? (
          <span className="oa-filter-total">{total}</span>
        ) : null}
      </label>
    </div>
  );
}
