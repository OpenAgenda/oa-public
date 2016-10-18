"use strict";

import utils from 'utils';

module.exports = {
  registerValidators,
  getFlat,
  getDefault
}

let registeredValidators = {};


function getFlat( fields, values ) {

  return Object.keys( fields ).map( f => {

    let fieldOptions = fields[ f ],

    type = _extractType( fieldOptions );

    return {
      field: f,
      validator: registeredValidators[ type ]( utils.extend( { field: f }, fieldOptions ) ),
      value: ( values || {} )[ f ]
    }

  } );

}


function getDefault( fields ) {

  let clean = {};

  Object.keys( fields ).forEach( k => {

    if ( fields[ k ].type === 'schema' ) {

      clean[ k ] = getDefault( fields[ k ].fields );

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

  registeredValidators = validators;

}