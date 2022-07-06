"use strict";

const _ = {
  get: require( 'lodash/get' ),
  keys: require( 'lodash/keys' ),
  uniq: require( 'lodash/uniq' )
};

const validates = {
  email: require( '@openagenda/validators/email' )(),
  phone: require( '@openagenda/validators/phone' )(),
  link: require( '@openagenda/validators/link' )()
};

import ih from 'immutability-helper';
import React, { Component } from 'react';
import TagsInput from 'react-tagsinput';

const separatorRegex = /;|,|\|/;

const iconClasses = {
  link: 'fa fa-link',
  phone: 'fa fa-phone',
  email: 'fa fa-envelope',
  error: 'fa fa-exclamation-circle'
};

const getValue = tag => tag instanceof Object ? tag.value : tag;


module.exports = class RegistrationComponent extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      inputValue: ''
    };

  }

  renderTag( t ) {
    const { key, tag, onRemove, className } = t;

    const type = this.getType( tag );
    const value = getValue( tag );

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

  onInputChange( e ) {

    const parts = e.target.value.split( separatorRegex );

    if ( parts.length <= 1 ) {

      return this.setState( {
        inputValue: e.target.value
      } );

    }

    this.appendValue( parts[ 0 ] );

  }

  onInputBlur( e ) {

    if ( !e.target.value.length ) return;

    this.appendValue( e.target.value );

  }

  onChange( value ) {

    this.setState( { inputValue: '' } );

    this.props.onChange( _.uniq( value ) );

  }

  appendValue( item ) {

    this.setState( { inputValue: '' } );

    this.props.onChange( _.uniq( ( this.props.value || [] ).concat( item ) ) );

  }

  render() {

    const field = this.props.field;

    const values = this.props.value || [];

    const errors = this.props.errors;

    return (
      <div className="registration">
        <TagsInput
          value={values}
          onChange={this.onChange.bind( this )}
          onlyUnique={true}
          renderTag={this.renderTag.bind( this )}
          addOnBlur={true}
          inputProps={{
            value: this.state.inputValue,
            onChange: this.onInputChange.bind( this ),
            placeholder: field.placeholder,
            onBlur: this.onInputBlur.bind( this ),
            style: !values.length ? { width: '630px' } : null
          }}
        />
      </div>
    );

  }

}
