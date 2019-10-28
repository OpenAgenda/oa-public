import React, { useCallback } from 'react';
import Spinner from '@openagenda/react-components/build/Spinner';
import BsField from './BsField';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

export default function SearchInput({
  input,
  type,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  action,
  loading,
  ...props
}) {
  const inputAttrs = {
    placeholder,
    className,
    spellCheck,
    autoFocus
  };
  const onChange = useCallback(
    e => {
      input.onChange(e.target.value);
      action(e.target.value);
    },
    [input, action]
  );

  return (
    <BsField input={input} {...props}>
      <div className="input-icon-right">
        <input {...input} {...inputAttrs} onChange={onChange} />
        <button type="submit" className="btn">
          {loading ? (
            <Spinner options={searchSpinner} />
          ) : (
            <i className="fa fa-search" aria-hidden="true" />
          )}
        </button>
      </div>
    </BsField>
  );
}
