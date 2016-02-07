"use strict";

var utils = require( 'utils' );

/**
 * processes an array of values of potentially different
 * types. Throws a concatenation of all errors with
 * an index.
 */

module.exports = function( config, validators ) {

  if ( arguments.length == 1 ) {

    validators = config;
    config = {};

  }

  utils.extend( validate, {
    type: 'list',
    clean: clean,
    decorate: decorate,
    validateItem: validateItem,
    decorateItem: decorateItem
  } );

  return validate;

  function validate( value, cleanOnly ) {

    var clean = [], errors = [];

    if ( !utils.isArray( value ) ) {

      throw {
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      }

    }

    value.forEach( function( item, i ) {

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

    validators.forEach( function( v ) {

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