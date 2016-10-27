"use strict";

var utils = require( 'utils' );

/**
 * processes an array of values of potentially different
 * types. Throws a concatenation of all errors with
 * an index.
 */

module.exports = function( config, validates ) {

  if ( arguments.length == 1 && utils.isArray( arguments[ 0 ] ) ) {

    validates = config;
    config = {};

  }

  var params = utils.extend( {
    field: null,
    optional: false,
    types: false,
    validators: false,
    validates: []
  }, config );

  utils.extend( validate, {
    type: 'list',
    clean,
    decorate,
    validateItem,
    decorateItem
  } );

  if ( validates ) {

    params.validates = validates;

  } else {

    if ( !params.types || !params.validators ) {

      throw new Error( 'if list validators are not given, validators and types must be provided in config' );

    }

    params.types.forEach( type => {

      if ( params.validators[ type ] === undefined ) {

        throw new Error( 'list validator requires ' + type + ' validator to function' );

      }

      params.validates.push( params.validators[ type ]() );

    } );

  }

  return utils.extend( validate, {
    type: 'list',
    field: params.field
  } );

  function validate( value, cleanOnly ) {

    var clean = [], errors = [];

    if ( params.optional && !value ) {

      return clean;

    }

    if ( params.optional && utils.isArray( value ) && !value.length ) {

      return clean;

    }

    if ( !utils.isArray( value ) ) {

      throw [ {
        field: params.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      } ]

    }

    value.forEach( ( item, i ) => {

      try {

        clean.push( validateItem( item ) );

      } catch( errs ) {

        errors = errors.concat( errs.map( function( e ) {

          e.index = i;

          return e;

        } ) );

      }

    } );

    if ( !cleanOnly && errors.length ) throw errors;

    return clean;

  }


  function clean( value ) {

    return validate( value, true );

  }


  function decorate( value ) {

    return ( value || [] ).map( decorateItem );
    
  }


  /**
   * process item against validators and
   * throw errors or return clean
   */

  function validateItem( item, decorated ) {

    var clean, errors = [], type;

    params.validates.forEach( v => {

      if ( clean ) return;

      try {

        type = v.type;

        clean = v( item );

      } catch( e ) {

        errors = errors.concat( e );

      }

    } );

    if ( clean !== undefined ) {

      return decorated ? {
        value: clean,
        type: type
      } : clean;

    }

    if ( decorated ) {

      return {
        value: item,
        errors: errors
      }

    }

    throw errors;

  }

  function decorateItem( item ) {

    return validateItem( item, true );

  }

}