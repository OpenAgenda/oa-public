"use strict";

const _ = {
  extend: require( 'lodash/extend' ),
  keys: require( 'lodash/keys' ),
  get: require( 'lodash/get' )
}

module.exports = {
  registerValidators,
  mapValuesToValidators,
  getDefault
}

const registeredValidators = {};


function mapValuesToValidators( fields, values ) {

  return _.keys( fields ).map( fieldName => ( {
    field: fieldName,
    validator: _makeValidator(
      _extractType( _.get( fields, fieldName ) ),
      fieldName,
      _.get( fields, fieldName ) // options
    ),
    value: _.get( values, fieldName )
  } ) );

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
