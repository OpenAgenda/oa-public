import React, { Component } from 'react';

export default class TextField extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    e.preventDefault();

    const {
      onChange
    } = this.props;

    // text field should be able to change to empty string
    onChange(e.target.value);
  }

  render() {
    const {
      field,
      value,
      enabled
    } = this.props;

    const {
      field: name,
      placeholder,
      fieldType,
      default: defaultValue
    } = field;

    const fieldProps = {
      name,
      rows: 3,
      className: 'form-control',
      value: value || defaultValue || '',
      placeholder,
      onChange: this.onChange,
      disabled: !enabled
    };

    return fieldType === 'textarea' ? <textarea {...fieldProps} /> : <input {...fieldProps} />;
  }
}
