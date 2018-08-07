"use strict";

import ih from 'immutability-helper';

import React, { Component } from 'react';

import TextField from './TextField';

module.exports = class DateField extends Component {

  parse( value ) {

    if ( !value ) return '';

    const clean = value instanceof Date ? value : new Date( value );

    return [ fZ( clean.getDate() ), fZ( clean.getMonth() + 1 ), clean.getFullYear() ].join( '/' );

  }

  onChange( value ) {

    this.props.onChange( value && value.length ? new Date( value ) : null );

  }

  render() {

    const props = ih( this.props, {
      value: {
        $set: this.parse( this.props.value )
      },
      onChange: {
        $set: this.onChange.bind( this )
      }
    } );

    return <div>
      <TextField {...props} />
      <p style={{color: 'red'}} className="pull-right">date field stub, do not use in production</p>
    </div>

  }

}


function fZ( n, size ) {

  if ( !size ) size = 2;

  var s = n + '',

  sign = s.substr( 0, 1 ) == '-' ? '-' : '';

  if ( sign.length ) {

    s = s.substr( 1 );

  }

  while ( s.length < size ) s = '0' + s;

  return sign + s;
}