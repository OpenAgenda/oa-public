"use strict";

var utils = require( 'utils' ),

text = require( './text' );

module.exports = function( config ) {

  var params = utils.extend( {
    field: false,
    optional: false,
    defaultLanguage: 'en'
  }, config || {} );

  return utils.extend( validate, {
    type: 'multilingual',
    field: params.field
  } );

  function validate( value ) {

    var clean = {}, tmp = {}, l, errors = [],

    validateText = text( params );

    if ( typeof value === 'string' ) {

      tmp[ params.defaultLanguage ] = value;

      value = tmp;

    };

    if ( !value ) value = {};

    for( l in value ) {

      try {

        clean[ l ] = validateText( value[ l ] );

      } catch( lErrors ) {

        errors = errors.concat( lErrors.map( function( error ) {

          error.lang = l;

          return error;

        } ) );

      }

    }

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }

}