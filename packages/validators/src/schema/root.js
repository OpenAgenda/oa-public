"use strict";

const _ = {
  extend: require( 'lodash/extend' )
}

module.exports = {
  registerValidators,
  getFlat,
  getDefault
}

const registeredValidators = {};


function getFlat( fields, values ) {

  return Object.keys( fields ).map( f => {

    let fieldOptions = fields[ f ],

    type = _extractType( fieldOptions );

    return {
      field: f,
      validator: _makeValidator( type, f, fieldOptions ),
      value: ( values || {} )[ f ]
    }

  } );

}


function _makeValidator( type, field, options ) {

  let validatorOptions = _.extend( { field }, options );

  if ( type === 'list' ) {

    validatorOptions.validators = registeredValidators;

  }

  return registeredValidators[ type ]( validatorOptions );

}


function getDefault( fields ) {

  let clean = {};

  Object.keys( fields ).forEach( k => {

    if ( fields[ k ].type === 'schema' ) {

      clean[ k ] = fields[ k ].list ? [] : getDefault( fields[ k ].fields );

    } else {

      clean[ k ] = fields[ k ].default === undefined ? null : fields[ k ].default;

    }

  } );

  return clean;

}


function _extractType( fieldOptions ) {

  if ( typeof registeredValidators[ fieldOptions.type ] === 'undefined' ) {

    throw new Error( 'Unregistered type: ' + fieldOptions.type );

  }

  return fieldOptions.type;

}


function registerValidators( validators ) {

  _.extend( registeredValidators, validators );

}