import React, { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-final-form';
import { useDebouncedCallback } from 'use-debounce';

function Input({ input, placeholder, onButtonClick }) {
  return (
    <div className="input-group mb-3">
      <input
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
        {...input}
      />
      <div className="input-group-append">
        <button
          type="submit"
          className="btn btn-outline-secondary"
          onClick={onButtonClick}
        >
          <i className="fa fa-search" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function SearchInput({
  inputComponent = Input,
  input,
  ...rest
}) {
  const form = useForm();
  const [tmpValue, setTmpValue] = useState(input.value);

  const debouncedOnChange = useDebouncedCallback(e => input.onChange(e), 400);

  const onChange = useCallback(e => {
    e.persist();

    setTmpValue(e.target.value);
    debouncedOnChange(e);
  }, [debouncedOnChange]);

  const wrappedInput = useMemo(() => ({
    ...input,
    value: tmpValue,
    onChange
  }), [input, onChange, tmpValue]);

  return React.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick: form.submit,
    ...rest
  });
}
