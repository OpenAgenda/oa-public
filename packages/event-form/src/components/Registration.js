"use strict";

const _ = {
  get: require( 'lodash/get' ),
  keys: require( 'lodash/keys' )
};

const validates = {
  email: require( '@openagenda/validators/email' )(),
  phone: require( '@openagenda/validators/phone' )(),
  link: require( '@openagenda/validators/link' )()
};

import ih from 'immutability-helper';
import React, { Component } from 'react';
import TagsInput from 'react-tagsinput';

import Sub from '@openagenda/form-schemas/client/build/Component/Sub';

const iconClasses = {
  link: 'fa fa-link',
  phone: 'fa fa-phone',
  email: 'fa fa-envelope',
  error: 'fa fa-exclamation-circle'
};


module.exports = class RegistrationComponent extends Component {

  renderTag( t ) {

    const { key, tag: value, onRemove, className } = t;

    const type = this.getType( value );

    return <span key={key} className={className + ( type === 'error' ? ' error' : '')}>
      <i className={iconClasses[ type ]}></i>
      {value}
      <a onClick={onRemove.bind( null, key )} />
    </span>

  }

  getType( value ) {

    for( const valueType of _.keys( validates ) ) {

      try {

        validates[ valueType ]( value );

        return valueType;

      } catch( e ) {}

    }

    return 'error';

  }

  render() {

    const field = this.props.field;

    const values = this.props.value || [];

    const errors = this.props.errors;

    return (
      <div className="registration">
        <TagsInput 
          value={values}
          onChange={this.props.onChange}
          renderTag={this.renderTag.bind( this )}
          inputProps={{
            placeholder: field.placeholder,
            style: !values.length ? { width: '630px' } : null
          }}
        />
      </div>
    );

  }

}
