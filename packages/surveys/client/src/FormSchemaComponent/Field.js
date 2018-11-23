import React, { Component } from 'react';
import classNames from 'classnames';

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

    const { value, onChange, type, field, error } = this.props;

    const Component = FieldComponents[ type ];

    return <div className={classNames( { 'form-group' : true, 'has-error' : !!error } ) } key={name}>
      {label?<label className="control-label">{label}</label>:null}
      <div>{error || info?<span>{error || info}</span>:null}</div>
      <Component
        type={type}
        field={field}
        value={value}
        onChange={onChange}
      />
    </div>

  }

}
