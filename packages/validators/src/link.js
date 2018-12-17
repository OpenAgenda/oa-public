"use strict";

const _ = {
  assign: require( 'lodash/assign' )
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

    let isEmail = true;

    const error = [ _.assign( {
      origin: value
    }, templateError ) ];

    if ( value ) {

      clean = value.trim();

    }

    if ( ( !value || !value.length ) && params.optional ) {

      return value;

    }

    try {

      emailValidator( value );

    } catch( e ) {

      isEmail = false;

    }

    if ( isEmail ) throw error;


    // add http:// if link is like www.google.com ( protocol missing )
    if ( !/^(http(s|):|)\/\//.test( clean ) ) {

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
