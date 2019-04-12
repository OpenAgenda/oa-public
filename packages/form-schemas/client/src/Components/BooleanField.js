import React, { Fragment } from 'react';

module.exports = props => {

  const {
    field: name,
    label
  } = props.field;

  const { value, onChange } = props;

  const checked = !!value;
  const defaultChecked = !!props.field.default;

  return <div>
    <label>
      <input
        type="checkbox"
        name={name}
        onChange={onChange.bind( null, !value )}
        checked={checked} />
      <label className="margin-left-xs control-label">{label}</label>
    </label>
  </div>

}
