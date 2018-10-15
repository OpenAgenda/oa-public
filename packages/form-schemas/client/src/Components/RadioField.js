"use strict";

import React, { Fragment } from 'react';

module.exports = props => {

  const {
    options,
    field: name,
  } = props.field;

  const { value, onChange } = props;

  return <Fragment>
    {options.map( o => <div
      className="radio"
      key={[name, o.value].join('.')} >
      <label>
        <input
          type="radio"
          name={name}
          onChange={onChange.bind( null, o.id )}
          checked={o.id===value} />
        {o.label}
      </label>
    </div> )}
  </Fragment>

}
