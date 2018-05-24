"use strict";

const text = require( '@openagenda/validators/text' ),

  email = require( '@openagenda/validators/email' ),

  date = require( '@openagenda/validators/date' ),

  number = require( '@openagenda/validators/number' ),

  link = require( '@openagenda/validators/link' ),

  schema = require( '@openagenda/validators/schema' );

schema.register( {
  text,
  link,
  number,
  email,
  date
} );

// define the schema

const protectedFields = [ 'is_activated', 'is_new', 'last_signin', 'last_inbox_check' ];

const schemaValidator = schema( {
  full_name: {
    type: 'text',
    min: 2
  },
  username: {
    type: 'text'
  },
  culture: {
    type: 'text',
    min: 2,
    max: 2
  },
  email: {
    type: 'email'
  },
  password: {
    type: 'text',
    min: 4
  },
  salt: {
    type: 'text'
  },
  image: {
    type: 'text'
  },
  store: {
    type: 'text'
  },
  is_activated: {
    type: 'boolean',
    default: false
  },
  is_new: {
    type: 'boolean'
  },
  last_signin: {
    type: 'date'
  },
  last_inbox_check: {
    type: 'date'
  },
  is_removed: {
    type: 'boolean'
  },
  new_password: {
    type: 'text',
    min: 4
  },
  api_key: {
    type: 'text'
  },
  api_secret: {
    type: 'text'
  }
} );

module.exports = Object.assign( validate, {
  update,
  updateProfile,
  changePassword,
  changeEmail,
  apiKeySet
} );


function validate( data, isProtected ) {

  return _validate( [
    'full_name',
    'culture',
    'email',
    'password',
    'salt'
  ].concat( isProtected ? [] : protectedFields ), data );

}

function update( data, isProtected, removing ) {

  const result = _validate( [
    'full_name',
    'username',
    'culture',
    'password',
    'salt',
    'image',
    'store',
    'is_removed'
  ].concat( isProtected ? [] : protectedFields )
    .concat( removing ? [] : 'email' )
    .filter( v => Object.keys( data ).indexOf( v ) !== -1 ), data );

  if ( removing ) {
    result.fields.email = data.email;
  }

  return result;

}

function updateProfile( data ) {

  return _validate( [
    'full_name',
    'culture'
  ].filter( v => Object.keys( data ).indexOf( v ) !== -1 ), data );

}

function changePassword( data ) {

  return _validate( [
    'new_password'
  ], data );

}

function changeEmail( data ) {

  return _validate( [
    'email',
    'password'
  ], data );

}

function apiKeySet( data ) {

  return _validate( [
    'api_key',
    'api_secret'
  ].filter( v => Object.keys( data ).indexOf( v ) !== -1 ), data );

}

function _validate( fields, data ) {

  try {

    return { valid: true, fields: schemaValidator.part( fields, data ) };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}
