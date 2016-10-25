"use strict";

import utils from 'utils';

/**
 * makes validator process lists
 */

module.exports = validator => {

  return utils.extend( validate, {
    type: validator.type,
    field: validator.field
  } );

  function validate( v ) {

    let clean = [], errors = [],

    value = v === undefined ? [] : v;

    if ( !utils.isArray( value ) ) {

      throw [ {
        field: validator.field,
        code: 'list.wrongtype',
        message: 'value should be a list',
        origin: value
      } ];

    }

    value.forEach( ( item, i ) => {

      try {

        clean.push( validator( item ) );

      } catch( errs ) {

        errors = errors.concat( errs.map( e => utils.extend( e, { index: i } ) ) );

      }

    } );

    if ( errors.length ) throw errors;

    return clean;

  }

}