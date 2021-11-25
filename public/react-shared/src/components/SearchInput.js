import React from 'react';
import Spinner from './Spinner';
import FieldInput from './FieldInput';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

const SearchInput = ({ getLabel, type, placeholder, className, spellCheck, action, loading, ...props }) => {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const onChange = e => {
    props.input.onChange(e.target.value);
    if (typeof action === 'function') {
      action(e.target.value);
    }
  };

  const content = <div className="input-icon-right">
    <input {...props.input} {...inputAttrs} onChange={onChange} />
    <button type="submit" className="btn">
      {loading ? <Spinner options={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
    </button>
  </div>;

  return <FieldInput getLabel={getLabel} content={content} {...props} />;
};

export default SearchInput;
