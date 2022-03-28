import { useUIDSeed } from 'react-uid';
import React, { useMemo } from 'react';
import cn from 'classnames';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';

export default function ChoiceField({
  input,
  getTotal,
  filter,
  option,
  disabled,
  inputType = 'checkbox'
}) {
  const seed = useUIDSeed();
  const total = useMemo(() => getTotal && getTotal(filter, option), [
    filter,
    getTotal,
    option,
  ]);

  return (
    <div className={cn(inputType, { disabled, active: input.checked, inactive: !input.checked })}>
      <label htmlFor={seed(input)}>
        <input
          type={inputType}
          id={seed(input)}
          disabled={disabled}
          {...input}
        />
        {getLocaleValue(option.label) || <>&nbsp;</>}
        {Number.isInteger(total) && total !== 0 ? (
          <span className="oa-filter-total">{total}</span>
        ) : null}
      </label>
    </div>
  );
}
