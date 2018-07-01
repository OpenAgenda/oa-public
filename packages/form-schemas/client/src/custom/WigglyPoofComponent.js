"use strict";

import React, { Component } from 'react';

module.exports = class WigglyPoofComponent extends Component {

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
      placeholder
    } = this.props.field;

    const { value, onChange, type } = this.props;

    const fieldProps = {
      name,
      rows: 3,
      className: 'form-control',
      value: value || '',
      placeholder,
      onChange: this.onChange
    }
   
    return <input { ...fieldProps } />

  }

}