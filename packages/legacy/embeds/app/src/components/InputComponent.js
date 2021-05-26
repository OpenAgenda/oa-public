import _ from 'lodash';
import React from 'react';
import {
  produce
} from 'immer';

export default ({
  embed,
  type,
  label,
  path,
  placeholder,
  sub,
  rows,
  onChange
}) => {
  const inputProps = {
    placeholder,
    className: 'form-control',
    name: path,
    value: _.get(embed, path) || '',
    onChange: e => onChange(produce(embed, draft => {
      _.set(draft, path, e.target.value);
    }))
  };

  return (
    <div className="form-group">
      <label htmlFor={path}>{label}</label>
      {type === 'textarea' ? <textarea rows={rows} {...inputProps} /> : <input type={type} {...inputProps} />}
      {sub ? <span className="sub">{sub}</span> : null}
    </div>
  );
};
