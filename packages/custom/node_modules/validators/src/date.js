"use strict";

import utils from 'utils'

const defaults = {
  field: false, // optional, name of associated field
  min: undefined, // optional - min allowed date
  max: undefined, // optional - max allowed date
  default: undefined, // if set, no input cleans to this
  optional: true // do I have to spell this out for you?
}

module.exports = config => {

  let params = utils.extend( {}, defaults, config || {} );

  return utils.extend( validate, {
    type: 'date',
    field: params.field
  } );

  function validate( value ) {

    let clean,

    errorDefaults = {
      origin: value
    };

    if ( validate.field ) {

      errorDefaults.field = validate.field;

    }

    // if its a string, attempt a conversion to date
    if ( typeof value === 'string' ) {

      clean = new Date( value );

      if ( clean.toString() === 'Invalid Date' ) {

        throw [ utils.extend( {
          code: 'date.invalid',
          message: 'not a date'
        }, errorDefaults ) ];

      }

    } else if ( typeof value === 'undefined' || value === null ) {

      if ( !params.default && !params.optional ) {

        throw [ utils.extend( {
          code: 'date.required',
          message: 'a date is required'
        }, errorDefaults ) ];

      }

      if ( params.default === 'now' ) {

        clean = new Date();

      } else if ( params.default ) {

        clean = new Date( params.default.getTime() );

      } else if ( value === null ) {

        clean = null;

      }

    } else {

      // if it not a string, it must be a date
      if ( ! ( value instanceof Date ) ) {

        throw [ utils.extend( {
          code: 'date.invalid',
          message: 'not a date',
        }, errorDefaults ) ];

      }

      clean = new Date( value.getTime() );

    }


    // if is bounded, test bounds
    
    if ( clean && params.min && clean < params.min ) {

      throw [ utils.extend( {
        code: 'date.toosmall',
        message: 'date is too small',
        values: {
          min: params.min
        }
      }, errorDefaults ) ];

    }

    if ( clean && params.max && clean > params.max ) {

      throw [ utils.extend( {
        code: 'date.toobig',
        message: 'date is too big',
        values: {
          max: params.max
        }
      }, errorDefaults ) ];

    }

    return clean;

  }

}