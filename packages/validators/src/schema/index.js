"use strict";

import extend from 'lodash/extend';
import isArray from 'lodash/isArray';
import utils from '@openagenda/utils';
import listify from '../listify';
import schemaUtils from './utils';
import cleanSchema from './clean';

const defaults = {
  fields: {}
}

let registeredValidators = { schema };

module.exports = extend( schema, { register } );

function schema( options ) {

  if ( !options ) {

    throw new Error( 'schema params missing at creation' );

  }

  const params = extend(
    { field: null, list: false },
    defaults,
    options.fields ? options : { fields: options, root: true }
  );

  if ( params.root ) {

    extend( params, cleanSchema( params.fields ) );

  }

  if ( params.field ) {

    extend( validate, { field: params.field } );

  }

  const defaultValue = schemaUtils.getDefault( params.fields );

  /**
   * exposed endpoints
   */
  return extend( params.list ? listify( validate, params ) : validate, {
    part,
    defaultValue, // .default is not tolerated by ie8
    default: defaultValue,
    fields: params.fields,
    type: 'schema',
    struct: params.root ? options : params.fields, // legacy
  } );

  function validate( value ) {

    const flattened = schemaUtils.mapValuesToValidators( params.fields, value );

    let errors = [], clean = {};

    flattened.forEach( flat => {

      try {

        clean[ flat.field ] = flat.validator( flat.value );

      } catch ( errs ) {

        if ( !isArray( errs ) ) {

          throw errs;

        }

        errors = errors.concat( errs.map( e => {

          return params.field ? extend( {}, e, { field: params.field + '.' + e.field } ) : e;

        } ) );

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }


  function part( path, value ) {

    if ( isArray( path ) ) {

      return parts( path, value );

    }

    let cursor = params.fields,

    branches = path.split( '.' ),

    leaf = branches.pop();

    // dig down
    branches.forEach( b => {

      cursor = cursor[ b ].fields;

    } );

    cursor = cursor[ leaf ];

    const type = cursor && cursor.type;

    if ( !type ) {

      throw {
        code: 'field.notdefined',
        message: 'field isn\'t defined',
        field: leaf
      };

    }

    let validator = registeredValidators[ type ]( cursor );

    return validator( value );

  }


  function parts( paths, value ) {

    let clean = {}, errors = [];

    paths.forEach( p => {

      try {

        utils.deep.set( clean, p, part( p, utils.deep( value, p ) ) );

      } catch( errs ) {

        errors = errors.concat( errs );

      }

    } );

    if ( errors.length ) throw errors;

    return clean;

  }

}


function register( v ) {

  Object.keys( v ).forEach( k => {

    registeredValidators[ k ] = v[ k ];

  } );

  schemaUtils.registerValidators( registeredValidators );

}
