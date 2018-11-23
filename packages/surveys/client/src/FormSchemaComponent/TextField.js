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

    const fieldProps = {
      name,
      rows: 3,
      className: 'form-control margin-v-xs',
      value: value || '',
      onChange: this.onChange
    }

    return type === 'textarea' ? <textarea {...fieldProps}></textarea> : <input { ...fieldProps } />

  }

}
