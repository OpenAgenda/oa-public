"use strict";

import React, { Component } from 'react';

module.exports = class TextField extends Component {

  render() {
    
    const { field: name } = this.props.field;

    const { value, onChange, type } = this.props;

    if ( type === 'textarea' ) {
      
      return <textarea
        name={name}
        rows={3}
        className="form-control"
        value={value || ''}
        onChange={onChange}
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