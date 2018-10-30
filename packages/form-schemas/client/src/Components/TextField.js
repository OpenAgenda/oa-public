"use strict";

import _ from 'lodash';
import React, { Component } from 'react';

module.exports = class TextField extends Component {

  constructor( props ) {

    super( props );

    this.onChange = this.onChange.bind( this );

  }

  onChange( e ) {

    e.preventDefault();

    const value = e.target.value;

    this.props.onChange( _.isString( value ) && !value.length ? null : value );

  }

  render() {
    
    const {
      field: name, 
      placeholder,
      fieldType
    } = this.props.field;

    const { value, onChange, enabled } = this.props;

    const fieldProps = {
      name,
      rows: 3,
      className: 'form-control',
      value: value || '',
      placeholder,
      onChange: this.onChange,
      disabled: !enabled
    }
   
    return fieldType === 'textarea' ? <textarea {...fieldProps}></textarea> : <input { ...fieldProps } />

  }

}
