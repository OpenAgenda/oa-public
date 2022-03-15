import React, { useCallback } from 'react';
import { Field, useField } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { defineMessages, useIntl } from 'react-intl';
import FilterPreviewer from '../FilterPreviewer';
import SearchInput from '../fields/SearchInput';

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
