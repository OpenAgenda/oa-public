"use strict";

const _ = {
  assign: require( 'lodash/assign' ),
  isString: require( 'lodash/isString' )
};
const isURL = require( 'validator/lib/isURL' );

const rgx = require( './regex' );
const emailValidator = require( './email' )();

module.exports = config => {

  const params = _.assign( {
    field: undefined,
    error: {
      code: 'link.invalid',
      message: 'value is not a link'
    },
    type: 'link',
    optional: true
  }, config || {} );

  const shouldntMatch = [
    /\s/,
    /\/:/,
    /;/
  ];

  function validator( value ) {

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

    if ( _isEmail( clean ) ) throw error;


    // add http:// if link is like www.google.com ( protocol missing )
    if ( !/^((http(s|):|)\/\/|mailto\:)/.test( clean ) ) {

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

  validator.type = 'link';

  validator.field = params.field;

  return validator;

}



function _isEmail( v ) {

  try {

    emailValidator( v );

  } catch( e ) {

    return false;

  }

  return true;

}
