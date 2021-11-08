import React, { useState, useCallback, useMemo } from 'react';
import { Field, useField, useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useIntl, defineMessages } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import FilterPreviewer from '../FilterPreviewer';

const subscription = { value: true };

const messages = defineMessages({
  placeholder: {
    id: 'ReactFilters.filters.searchFilter.placeholder',
    defaultMessage: 'Search'
  },
  previewLabel: {
    id: 'ReactFilters.filters.searchFilter.previewLabel',
    defaultMessage: 'Search',
  },
});

function Preview({
  name,
  filter,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      input.onChange(undefined);
    },
    [input, disabled]
  );

  if (!input.value || input.value === '') {
    return null;
  }

  return React.createElement(component, {
    name,
    filter,
    label: input.value,
    onRemove,
    disabled,
    ...rest,
  });
}

function Input({ input, placeholder, onButtonClick /* , disabled */ }) {
  return (
    <div className="form-group search">
      <div className="input-icon-right">
        <input
          type="text"
          className="form-control"
          autoComplete="off"
          placeholder={placeholder}
          // disabled={disabled}
          {...input}
        />
        <button type="submit" className="btn" onClick={onButtonClick}>
          <i className="fa fa-search" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function SearchInput({
  inputComponent = Input,
  input,
  placeholder,
  disabled,
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
    placeholder,
    disabled,
    onButtonClick: form.submit,
    ...rest,
  });
}

const SearchFilter = React.forwardRef(function SearchFilter({
  name,
  filter,
  component = SearchInput,
  placeholder,
  ...rest
}, _ref) {
  const seed = useUIDSeed();
  const intl = useIntl();

  return (
    <>
      <Field
        key={seed(filter)}
        name={name}
        subscription={subscription}
        component={component}
        type="text"
        filter={filter}
        placeholder={placeholder || intl.formatMessage(messages.placeholder)}
        {...rest}
      />
    </>
  );
});

const exported = React.memo(SearchFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
