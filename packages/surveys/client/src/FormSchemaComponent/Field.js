"use strict";

import React, { Component } from 'react';

const FieldComponents = {
  text: require( './TextField' ),
  textarea: require( './TextField' ),
  radio: require( './RadioField' ),
  checkbox: require( './CheckboxField' )
}

module.exports = class RadioField extends Component {

  render() {

    const {
      label,
      options,
      field: name,
      info
    } = this.props.field;

    const { value, onChange, type, field } = this.props;

    const Component = FieldComponents[ type ];

    return <div className="form-group" key={name}>
      {label?<label>{label}</label>:null}
      {info?<div><span>{info}</span></div>:null}
      <Component
        type={type}
        field={field}
        value={value}
        onChange={onChange}
      />
    </div>

  }

}
