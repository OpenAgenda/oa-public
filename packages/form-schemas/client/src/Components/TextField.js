"use strict";

import React, { Component } from 'react';

module.exports = class TextField extends Component {

  constructor( props ) {

    super( props );

    this.onChange = this.onChange.bind( this );

  }

  onChange( e, value ) {

    e.preventDefault();
    
    this.props.onChange( e.target.value );

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
