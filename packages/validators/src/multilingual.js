"use strict";

const DEFAULT_LANGUAGE = 'en';

const _ = {
  assign: require( 'lodash/assign' ),
  get: require( 'lodash/get' ),
  keys: require( 'lodash/keys' ),
  isArray: require( 'lodash/isArray' ),
  isString: require( 'lodash/isString' )
};

const text = require( './text' );

module.exports = ( config = {} )=> {

  const params = _.assign( {
    field: false,
    optional: true,
    defaultLanguage: null,
    languages: [] // if array is set, languages are required
  }, config || {} );

  return _.assign( validate, {
    type: 'multilingual',
    field: params.field
  } );

  function validate( origin ) { 

    const clean = {}, tmp = {};

    const validateText = text( params );

    let errors = [];

    const value = {};

    if ( _.isString( origin ) && params.languages.length ) {

      _.assign( value, params.languages.reduce( ( c, l ) => {

        c[ l ] = origin;

        return c;

      }, {} ) );

    } else if ( _.isString( origin ) ) {

      const obj = {};

      obj[ params.defaultLanguage || DEFAULT_LANGUAGE ] = origin;

      _.assign( value, obj );

    } else {

      _.assign( value, origin || {} );

    }

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

        errors = errors.concat( lErrors.map( e => _.assign( { lang: l }, e ) ) );

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }

}
