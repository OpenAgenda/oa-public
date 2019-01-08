import React, { Component } from 'react';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import Field from './Field';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

const SearchInput = ( { type, placeholder, className, spellCheck, action, loading, ...props } ) => {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const onChange = e => {
    props.input.onChange( e.target.value );
    action();
  };

  const content = <div className="input-icon-right">
    <input {...props.input} {...inputAttrs} onChange={onChange} />
    <button type="submit" className="btn">
      {loading ? <Spinner spinner={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
    </button>
  </div>;

  return <Field content={content} {...props} />;
};

export default SearchInput;
