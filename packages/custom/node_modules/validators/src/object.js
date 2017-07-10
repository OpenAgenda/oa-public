"use strict";

import utils from 'utils';
import listify from './listify';

const MODES = {
  KEYED: 'keyed',
  LIST: 'list'
}

module.exports = function( options, validators ) {

  if ( arguments.length === 1 ) {

    validators = options;
    options = {};

  }

  const params = utils.extend( {
    field: null,
    list: false
  }, options ),

  validator = utils.extend( validate, {
    type: 'object',
    field: params.field,
  } );

  return params.list ? listify( validator ) : validator;

  function validate( values ) {

    var clean = [], errors = [];

    validators.forEach( validator => {

      let matchingValue = ( values || [] ).filter( v => v.field === validator.field );

      matchingValue = matchingValue.length ? matchingValue[ 0 ] : {
        field: validator.field, 
        value: validator.type === 'object' ? [] : undefined
      };

      if ( validator.type !== 'object' ) {

        try {

          clean.push( {
            field: matchingValue.field,
            value: validator( matchingValue.value )
          } );

        } catch ( e ) {

          errors = errors.concat( e );

        }

      } else if ( typeof matchingValue.value !== 'object' ) {

        errors = errors.concat( [ {
          field: matchingValue.field,
          origin: matchingValue.value,
          code: 'object.invalidtype',
          message: 'not an object'
        } ] );

      } else {

        try {

          clean = clean.concat( 

            validator( matchingValue.value ).map( c => utils.extend( c, {
              field: matchingValue.field + '.' + c.field
            } ) )

          );

        } catch ( e ) {

          errors = errors.concat( 

            e.map( objErr => utils.extend( objErr, {
              field: matchingValue.field + '.' + objErr.field
            } ) )

          );

        }

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }

}