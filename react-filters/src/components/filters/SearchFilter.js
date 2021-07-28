import React from 'react';
import { Field, useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useIntl, defineMessages } from 'react-intl';

const messages = defineMessages({
  placeholder: {
    id: 'ReactFilters.filters.searchFilter.placeholder',
    defaultMessage: 'Search'
  }
});

const subscription = { value: true };

function Input({ input, placeholder }) {
  const form = useForm();

  return (
    <div className="form-group search">
      <div className="input-icon-right">
        <input
          name="search"
          type="text"
          className="form-control"
          autoComplete="off"
          placeholder={placeholder}
          {...input}
        />
        <button type="submit" className="btn" onClick={form.submit}>
          <i className="fa fa-search" aria-hidden="true" />
        </button>

      </div>
    </div>
  );
}

const SearchFilter = React.forwardRef(function SearchFilter({
  name,
  filter,
  component = Input,
  disabled,
  placeholder
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
        disabled={disabled}
        placeholder={placeholder || intl.formatMessage(messages.placeholder)}
      />
    </>
  );
});

export default React.memo(SearchFilter);
