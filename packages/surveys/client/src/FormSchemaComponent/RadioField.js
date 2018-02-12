"use strict";

import React, { Component, Fragment } from 'react';

module.exports = class RadioField extends Component {

  render() {

    const {
      options,
      field: name,
    } = this.props.field;

    const { value, onChange } = this.props;

    return <Fragment>
      {options.map( o => <div
        className="radio"
        key={[name, o.value].join('.')} >
        <label>
          <input
            type="radio"
            name={name}
            value={o.value}
            onChange={onChange.bind( null, o.value )}
            checked={o.value===value} />
          {o.label}
        </label>
      </div> )}
    </Fragment>

  }

}
