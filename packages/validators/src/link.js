"use strict";

const _ = {
  assign: require( 'lodash/assign' ),
  isString: require( 'lodash/isString' )
};
const isURL = require( 'validator/lib/isURL' );

const listify = require('./listify');
const rgx = require( './regex' );
const emailValidator = require( './email' )();

module.exports = config => {

  const params = _.assign( {
    field: undefined,
    error: {
      code: 'link.invalid',
      message: 'value is not a link'
    },
    list: false,
    type: 'link',
    optional: true
  }, config || {} );

  const shouldntMatch = [
    /\s/,
    /\/:/,
    /;/
  ];

  const validator = Object.assign( validate, {
    type: 'link',
    field: params.field
  } );

  return params.list ? listify( validator, params ) : validator;

  function validate( value ) {

    const templateError = {
      field: validator.field,
      code: 'link.invalid',
      message: 'value is not a link'
    };

    let clean = value;

    const error = [ _.assign( {
      origin: value
    }, templateError ) ];

    if ( _.isString( value ) ) {

      clean = value.trim();

    }

    if ( ( !value || !value.length ) && params.optional ) {

      return params.default !== undefined ? params.default : clean;

    }

    if ( /^mailto\:/.test( clean ) && _isEmail( clean.replace( /^mailto\:/, '' ) ) ) {

      return clean;

    }

    const startsWithProtocol = /^((http(s|):|)\/\/|mailto\:)/.test(clean);

    if ( !startsWithProtocol && _isEmail( clean ) ) throw error;

    // add http:// if link is like www.google.com ( protocol missing )
    if (!startsWithProtocol) {

      clean = 'http://' + clean;

    }

    if ( clean.indexOf( '.' ) == -1 ) {

      throw error;

    }

    if ( clean.substr( clean.length - 1, 1 ) === '.' ) {

      throw error;

    }

    shouldntMatch.forEach( rgx => {

      if ( rgx.test( clean ) ) {

        throw error;

      }

    } );

    if ( !isURL( clean, {
      allow_protocol_relative_urls: true
    } ) ) {
      throw error;

    }

    return clean;

  };

}



function _isEmail( v ) {

  try {

    emailValidator( v );

  } catch( e ) {

    return false;

  }

  return true;

}
