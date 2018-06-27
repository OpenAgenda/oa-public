"use strict";

import React, { Component } from 'react';
import classNames from 'classnames';

import FieldCounter from './FieldCounter';

const FieldComponents = {
  multilingual: require( './Multilingual' ),
  text: require( './TextField' ),
  textarea: require( './TextField' ),
  radio: require( './RadioField' ),
  checkbox: require( './CheckboxField' )
}

module.exports = class Field extends Component {

  render() {

    const {
      label,
      field: name,
      languages,
      optional,
      info,
      max
    } = this.props.field;

    const isMultilingual = _.isArray( languages ) && languages.length > 1;

    const {
      value,
      onChange,
      type, 
      field,
      error,
      labels 
    } = this.props;

    const Component = FieldComponents[ isMultilingual ? 'multilingual' : type ];

    return <div className={classNames( {
      'form-group' : true, 
      'has-error' : !!error,
      'multilingual-input-field' : isMultilingual
    } ) } key={name}>
      {label ? <label className="control-label">{label}</label> : null}
      {optional ? '' : <span className="margin-left-xs">{'( ' + labels.required + ' )'}</span>}
      <div>{error || info?<span>{error || info}</span>:null}</div>
      <Component
        type={type}
        field={field}
        value={value}
        onChange={onChange}
      />
      {max&&!isMultilingual?<FieldCounter value={value} max={max}/>:null}
    </div>

  }

}
