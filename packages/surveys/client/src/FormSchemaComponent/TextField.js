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
    
    const { field: name } = this.props.field;

    const { value, onChange, type } = this.props;

    if ( type === 'textarea' ) {
      
      return <textarea
        name={name}
        rows={3}
        className="form-control"
        value={value || ''}
        onChange={this.onChange}
        >
      </textarea>
      
    }

    return <input
      className="form-control"
      name={name}
      type="text"
      value={value || ''}
      onChange={onChange} 
    />

  }

}