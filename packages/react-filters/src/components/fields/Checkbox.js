import { useUIDSeed } from 'react-uid';
import React, { useMemo } from 'react';
import cn from 'classnames';
import getLocaleValue from '../../utils/getLocaleValue';

export default function Checkbox({
  input, meta, getTotal, filter, option
}) {
  const seed = useUIDSeed();
  const total = useMemo(() => getTotal && getTotal(filter, option), [
    filter,
    getTotal,
    option,
  ]);

  return (
    <div className={cn('checkbox', { disabled: meta.submitting })}>
      <label htmlFor={seed(input.value)}>
        <input
          type="checkbox"
          id={seed(input.value)}
          disabled={meta.submitting}
          {...input}
        />{' '}
        {getLocaleValue(option.label)}
        {total ? <span className="oa-filter-total">{total}</span> : null}
      </label>
    </div>
  );
}
