"use strict";

import objectValidator from './object';
import utils from 'utils';

let validators = {};

schema.register = register;

module.exports = schema;

function schema( struct ) {

  let validator = build( struct );

  validate.part = part;

  validate.struct = struct;

  validate.default = _getDefault( struct );

  return validate;

  function validate( values, _subValidator = null, subStruct = null ) {

    // initialize undefined or null to empty obj if top level
    if ( _subValidator === null && subStruct === null && !values ) {

      values = {};

    }

    let listValues = _mapToList( values, subStruct || struct );

    let clean = ( _subValidator || validator )( listValues );

    return _mapToObject( clean );

  }


  /**
   * validate a subset of the schema
   * @param  list   fields     the list of fields
   * @param  object values     values to be validated
   * 
   * @return object            the object of clean values
   */
  function part( fields, values ) {

    if ( typeof fields === 'string' ) {

      return validateField( fields, values );

    }

    // if is not a string, fields is an array of field names

    if ( !utils.isArray( fields ) ) {

      throw 'wrong part input';

    }

    let clean = {}, errors = [];

    fields.forEach( field => {

      // dig into values object if field is deep
      
      let value = values;

      field.split( '.' ).forEach( fieldPart => {

        value = value[ fieldPart ];

      } );

      try {

        let cleanPart = clean,

        fieldParts = field.split( '.' ),

        leafField = fieldParts.pop();

        fieldParts.forEach( fieldPart => {

          if ( !cleanPart[ fieldPart ] ) cleanPart[ fieldPart ] = {};

          cleanPart = cleanPart[ fieldPart ];

        } );

        cleanPart[ leafField ] = validateField( field, value );

      } catch ( e ) {

        errors = errors.concat( e );

      }

    } );

    if ( errors.length ) throw errors;

    return clean;

  }


  function validateField( address, values ) {

    let subStruct = struct;

    // dig in the struct to reach the right spot
    address.split( '.' ).forEach( a => {

      subStruct = subStruct[ a ];

    } );

    if ( subStruct === undefined ) throw new Error( 'Schema part not found: ' + address );
    
    if ( _isLeaf( subStruct ) ) {

      return _buildValidator( address, subStruct )( values );

    }

    return validate( values, build( subStruct ), subStruct );

  }

}

function build( struct, field ) {

  let validatorStruct = Object.keys( struct ).map( k => {

    let type = _getType( k, struct );

    if ( type !== 'object' && typeof validators[ type ] === 'undefined' ) {

      throw 'unregistered validator type: ' + struct[ k ].type;

    }

    if ( type === 'object' ) {

      return build( struct[ k ], k );

    } else {

      return _buildValidator( k, struct[ k ] );

    }

  } );

  return objectValidator( { field }, validatorStruct );

}


function register( v ) {

  Object.keys( v ).forEach( k => {

    validators[ k ] = v[ k ];

  } );

}


function _mapToList( values, struct ) {

  return Object.keys( struct ).map( k => {

    // filter out non defined values which are non-objects

    let type = _getType( k, struct );

    if ( type === 'object' && ( typeof values[ k ] === 'undefined' || values[ k ] === null ) ) {

      return {
        field: k,
        value: [ {} ]
      }

    }

    if ( typeof values[ k ] === 'undefined' ) {

      return false;

    }

    return {
      field: k,
      value: type === 'object' ? _mapToList( values[ k ], struct[ k ] ) : values[ k ]
    }

  } ).filter( v => v );

}


function _getType( k, struct ) {

  let type = struct[ k ].type || 'object';

  // handle special case where sub object is keyed with 'type'
  if ( typeof type === 'object' ) {
    
    type = 'object';

  }

  return type;

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


function _getDefault( struct ) {

  let d = {};

  Object.keys( struct ).forEach( k => {

    if ( !struct[ k ] ) {

      d[ k ] = null;

    } else if ( _isLeaf( struct[ k ] ) ) {

      d[ k ] = struct[ k ].default === undefined ? null : struct[ k ].default;

    } else {

      d[ k ] = _getDefault( struct[ k ] );

    }

  } );

  return d;

}