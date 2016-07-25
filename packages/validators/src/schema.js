"use strict";

import objectValidator from './object';
import utils from 'utils';

let validators = {};

schema.register = register;

module.exports = schema;

function schema( struct ) {

  let validator = build( struct );

  validate.part = part;

  return validate;

  function validate( values, _subValidator = null ) {

    let listValues = _mapToList( values );

    let clean = ( _subValidator || validator )( listValues );

    return _mapToObject( clean );

  }

  function part( address, values ) {

    let subStruct = struct;

    // dig in the struct to reach the right spot
    address.split( '.' ).forEach( a => {

      subStruct = subStruct[ a ];

    } );

    if ( subStruct === undefined ) throw new Error( 'Schema part not found: ' + address );
    
    if ( _isLeaf( subStruct ) ) {

      return _buildValidator( address, subStruct )( values );

    }

    return validate( values, build( subStruct ) );

  }

}

function build( struct, field ) {

  let validatorStruct = Object.keys( struct ).map( k => {

    let type = struct[ k ].type || 'object';

    if ( type !== 'object' && typeof validators[ type ] === 'undefined' ) {

      throw 'unregistered validator type: ' + struct[ k ].type;

    }

    if ( type === 'object' ) {

      return build( struct[ k ], k );

    } else {

      return _buildValidator( k, struct[ k ] );

    }

  } );

  return objectValidator( { field: field }, validatorStruct );

}


function register( v ) {

  Object.keys( v ).forEach( k => {

    validators[ k ] = v[ k ];

  } );

}


function _mapToList( values ) {

  if ( !values ) return [];

  return Object.keys( values ).map( k => {

    let isObject = values[ k ] && typeof values[ k ] === 'object';

    return {
      field: k,
      value: isObject ? _mapToList( values[ k ] ) : values[ k ]
    }

  } );

}


function _mapToObject( values ) {

  if ( !values ) return {};

  let obj = {};

  values.forEach( v => {

    if ( v.field.split( '.' ).length > 1 ) {

      let cursor = obj,

      namespaces = v.field.split( '.' ),

      field = namespaces.pop();

      namespaces.forEach( namespace => {

        if ( cursor[ namespace ] === undefined ) cursor[ namespace ] = {};

        cursor = cursor[ namespace ];

      } );

      cursor[ field ] = v.value;

    } else {

      obj[ v.field ] = v.value;

    }

  } );

  return obj;

}


/**
 * is a leaf if no objects are referenced in structure
 */
function _isLeaf( struct ) {

  return !Object.keys( struct ).filter( k => struct[ k ] !== null && typeof struct[ k ] === 'object' ).length;

}

function _buildValidator( field, definition ) {

  return validators[ definition.type ]( utils.extend( definition, { field: field } ) );

}