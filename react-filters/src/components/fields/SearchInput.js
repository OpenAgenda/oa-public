import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-final-form';
import { useDebouncedCallback } from 'use-debounce';
import { defineMessages, useIntl } from 'react-intl';
import FiltersAndWidgetsContext from '../../contexts/FiltersAndWidgetsContext.js';

const messages = defineMessages({
  ariaLabel: {
    id: 'ReactFilters.components.fields.SearchInput.ariaLabel',
    defaultMessage: 'Search',
  },
});

function Input({ input, placeholder, ariaLabel, onButtonClick, manualSubmit }) {
  const intl = useIntl();

  return (
    <div className="input-group mb-3">
      <input
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={ariaLabel}
        title={ariaLabel}
        {...input}
      />
      {!manualSubmit ? (
        <div className="input-group-append">
          <button
            type="submit"
            className="btn btn-outline-secondary"
            onClick={onButtonClick}
            aria-label={intl.formatMessage(messages.ariaLabel)}
          >
            <i className="fa fa-search" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchInput({
  inputComponent = Input,
  input,
  onChange, // user onChange
  manualSearch,
  ...rest
}) {
  const form = useForm();
  const [tmpValue, setTmpValue] = useState(input.value);

  const {
    filtersOptions: { manualSubmit },
  } = useContext(FiltersAndWidgetsContext);

  const debouncedOnChange = useDebouncedCallback((e) => {
    if (manualSearch) {
      return;
    }

    input.onChange(e);
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  }, 400);

  const inputOnChange = useCallback(
    (e) => {
      e.persist();

      setTmpValue(e.target.value);
      debouncedOnChange(e);
      // direct call with manualSubmit
      if (manualSubmit) {
        debouncedOnChange.flush();
      }
    },
    [debouncedOnChange],
  );

  const onButtonClick = useCallback(
    (e) => {
      e.preventDefault();
      if (manualSearch) {
        input.onChange(tmpValue);
        if (typeof onChange === 'function') {
          onChange(tmpValue);
        }
      }
      return form.submit();
    },
    [form, input, manualSearch, onChange, tmpValue],
  );

  const wrappedInput = useMemo(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange,
    }),
    [input, inputOnChange, tmpValue],
  );

  useEffect(() => {
    setTmpValue(input.value);
  }, [input.value]);

  return React.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    ...rest,
  });
}
