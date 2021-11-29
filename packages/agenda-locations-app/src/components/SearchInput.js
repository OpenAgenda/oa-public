import React, { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const SearchInput = ({ onChange, placeholder }) => {
  const [tmpValue, setTmpValue] = useState('');

  const debouncedOnChange = useDebouncedCallback(value => onChange(value), 1000);

  const myOnChange = useCallback(e => {
    e.persist();
    setTmpValue(e.target.value);
    debouncedOnChange(e.target.value);
  }, [debouncedOnChange]);

  const handleKeyPress = event => {
    if (event.key === 'Enter') onChange(tmpValue);
  };

  return (
    <div className="search-field input-icon-right">
      <input
        name="search"
        type="text"
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
        onChange={myOnChange}
        value={tmpValue}
        onKeyPress={handleKeyPress}
      />
      <button type="submit" className="btn" onClick={() => onChange(tmpValue)}>
        <i className="fa fa-search" aria-hidden="true" />
      </button>
    </div>

  );
};

export default SearchInput;
