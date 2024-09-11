import { useState, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';

const messages = defineMessages({
  search: {
    id: 'AgendaLocations.SearchInput.search',
    defaultMessage: 'Search',
  },
});

const SearchInput = ({ onChange, placeholder, initValue, onFocus }) => {
  const intl = useIntl();
  const [tmpValue, setTmpValue] = useState(initValue || '');
  const debouncedOnChange = useDebouncedCallback(
    (value) => onChange(value),
    1000,
  );

  const myOnChange = useCallback(
    (e) => {
      e.persist();
      setTmpValue(e.target.value);
      debouncedOnChange(e.target.value);
    },
    [debouncedOnChange],
  );

  const myOnFocus = useCallback(
    (e) => {
      e.persist();
      if (!onFocus) {
        return;
      }
      onFocus(e.target.value);
    },
    [onFocus],
  );

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') onChange(tmpValue);
  };

  return (
    <div className="search-field input-group input-icon-right">
      <label className="sr-only" htmlFor="label">
        {placeholder}
      </label>
      <input
        name="search"
        type="text"
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
        onChange={myOnChange}
        value={tmpValue}
        onKeyPress={handleKeyPress}
        onFocus={myOnFocus}
      />
      <span className="input-group-btn">
        <button
          type="button"
          className="btn btn-default"
          onClick={() => onChange(tmpValue)}
          aria-label={intl.formatMessage(messages.search)}
        >
          <i className="fa fa-search" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
};

export default SearchInput;
