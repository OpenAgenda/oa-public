"use strict";

const _ = {
  extend: require( 'lodash/extend' ),
  set: require( 'lodash/set' ),
  get: require( 'lodash/get' ),
  keys: require( 'lodash/keys' ),
  isArray: require( 'lodash/isArray' )
};

const text = require( './text' );

module.exports = config => {

  const params = _.extend( {
    field: false,
    optional: true,
    defaultLanguage: 'en',
    languages: [] // if array is set, languages are required
  }, config || {} );

  return _.extend( validate, {
    type: 'multilingual',
    field: params.field
  } );

  function validate( origin ) { 

    const clean = {}, tmp = {};

    const validateText = text( params );

    let errors = [];

    const value = typeof origin === 'string' 
      ? [ params.defaultLanguage ].reduce( l => _.set( {}, l, origin ), {} )
      : origin || {};

    // if languages have been pre-specified, they should be
    // part of validation and sanitizing
    if ( _.isArray( params.languages ) ) {

      params.languages.forEach( l => {

        value[ l ] = _.get( value, l, '' );        

      } );

    }

    if ( !params.optional && !_.keys( value ).length ) {

      throw [ {
        field: params.field,
        code: 'required',
        message: 'at least one language entry is required',
        origin
      } ]

    }



    if ( !_.keys( value ).length && typeof params.default !== 'undefined' ) {

      return params.default;

    }

    _.keys( value ).forEach( l => {

      let langValue = value[ l ];

      if ( langValue === undefined || langValue === null ) {

        return;

      }

      try {

        clean[ l ] = validateText( langValue );

      } catch( lErrors ) {

        errors = errors.concat( lErrors.map( e => _.extend( { lang: l }, e ) ) );

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }

}