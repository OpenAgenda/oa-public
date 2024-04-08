import React, { useMemo, useRef } from 'react';
import { useUIDSeed } from 'react-uid';
import { useIntl } from 'react-intl';
import cn from 'classnames';
import { getLocaleValue } from '@openagenda/intl';
import a11yButtonActionHandler from '@openagenda/react-shared/lib/utils/a11yButtonActionHandler';

function useOnChoiceChange(input) {
  const inputRef = useRef();

  const onChange = useMemo(
    () =>
      a11yButtonActionHandler(e => {
        if (e.target === inputRef.current) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.currentTarget.getAttribute('aria-disabled') === 'true') {
          return;
        }

        if (e.currentTarget.getAttribute('aria-checked') === 'true') {
          input.onChange({
            target: {
              type: input.type,
              value: input.value,
              checked: false,
            },
          });
          return;
        }

        input.onChange({
          target: {
            type: input.type,
            value: input.value,
            checked: true,
          },
        });
      }),
    [input.onChange, input.type, input.value],
  );

  return {
    inputRef,
    onChange,
  };
}

export default function ChoiceField({
  input,
  getTotal,
  filter,
  option,
  disabled,
}) {
  const intl = useIntl();
  const seed = useUIDSeed();
  const total = useMemo(
    () => getTotal?.(filter, option),
    [filter, getTotal, option],
  );

  const { inputRef, onChange } = useOnChoiceChange(input);

  // option, onChange, input, total, disabled

  return (
    <div
      className={cn(input.type, {
        disabled,
        active: input.checked,
        inactive: !input.checked,
      })}
    >
      <span
        className="oa-choice-option-label"
        role="checkbox"
        tabIndex="0"
        aria-checked={input.checked}
        aria-disabled={disabled}
        onClick={onChange}
        onKeyPress={onChange}
      >
        <input
          ref={inputRef}
          tabIndex="-1"
          type={input.type}
          id={seed(input)}
          disabled={disabled}
          {...input}
        />
        {getLocaleValue(option.label, intl.locale) || <>&nbsp;</>}
        {Number.isInteger(total) && total !== 0 ? (
          <span className="oa-filter-total">{total}</span>
        ) : null}
      </span>
    </div>
  );
}
