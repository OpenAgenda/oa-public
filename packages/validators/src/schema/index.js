"use strict";

import utils from 'utils';
import listify from '../listify';
import r from './root';
import cleanSchema from './clean';

const defaults = {
  fields: {}
}

let registeredValidators = { schema };

module.exports = utils.extend( schema, { register } );

function schema( options ) {

  if ( !options ) {

    throw new Error( 'schema params missing at creation' );

  }

  const params = utils.extend( 
    { field: null, list: false }, 
    defaults, 
    options.fields ? options : { fields: options, root: true }
  );

  if ( params.root ) {

    utils.extend( params, cleanSchema( params.fields ) );

  }

  /**
   * exposed endpoints
   */
  return utils.extend( params.list ? listify( validate ) : validate, { 
    part,
    default: r.getDefault( params.fields ),
    fields: params.fields,
    struct: params.root ? options : params.fields // legacy
  } );

  function validate( value ) {

    const flattened = r.getFlat( params.fields, value );

    let errors = [], clean = {};

    flattened.forEach( flat => {

      try {

        clean[ flat.field ] = flat.validator( flat.value );

      } catch ( errs ) {

        errors = errors.concat( errs.map( e => {

          return params.field ? utils.extend( {}, e, { field: params.field + '.' + e.field } ) : e;

        } ) );

      }

    } );

    if ( errors.length ) {

      throw errors;

    }

    return clean;

  }


  function part( path, value ) {

    if ( utils.isArray( path ) ) {

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

    let validator = registeredValidators[ cursor.type ]( cursor );

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

  r.registerValidators( registeredValidators );

}