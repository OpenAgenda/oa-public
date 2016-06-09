"use strict";

const setValidator = require( 'validators/set' ),

  text = require( 'validators/text' ),

  email = require( 'validators/email' ),

  number = require( 'validators/number' ),

  utils = require( 'utils' );


module.exports = Object.assign( validate, {
  update,
  updateProfile,
  changePassword,
  changeEmail
} );


function validate( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'full_name',
      min: 2
    } ),
    text( {
      field: 'culture',
      min: 2,
      max: 2
    } ),
    email( {
      field: 'email'
    } ),
    text( {
      field: 'password'
    } ),
    text( {
      field: 'salt'
    } )
  ], { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'full_name',
      value: fields.full_name
    }, {
      field: 'culture',
      value: fields.culture
    }, {
      field: 'email',
      value: fields.email
    }, {
      field: 'password',
      value: fields.password
    }, {
      field: 'salt',
      value: fields.salt
    } ] );


    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function update( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'full_name',
      min: 2
    } ),
    text( {
      field: 'username'
    } ),
    text( {
      field: 'culture',
      min: 2,
      max: 2
    } ),
    email( {
      field: 'email'
    } ),
    text( {
      field: 'password'
    } ),
    text( {
      field: 'salt'
    } ),
    text( {
      field: 'image'
    } ),
    text( {
      field: 'store'
    } ),
    number( {
      field: 'is_activated'
    } ),
    number( {
      field: 'is_removed'
    } )
  ].filter( v => Object.keys( fields ).indexOf( v.field ) !== -1 ), { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'full_name',
      value: fields.full_name
    }, {
      field: 'username',
      value: fields.username
    }, {
      field: 'culture',
      value: fields.culture
    }, {
      field: 'email',
      value: fields.email
    }, {
      field: 'password',
      value: fields.password
    }, {
      field: 'salt',
      value: fields.salt
    }, {
      field: 'image',
      value: fields.image
    }, {
      field: 'store',
      value: fields.store
    }, {
      field: 'is_activated',
      value: fields.is_activated
    }, {
      field: 'is_removed',
      value: fields.is_removed
    } ] );

    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function updateProfile( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'full_name',
      min: 2
    } ),
    text( {
      field: 'culture',
      min: 2,
      max: 2
    } )
  ].filter( v => Object.keys( fields ).indexOf( v.field ) !== -1 ), { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'full_name',
      value: fields.full_name
    }, {
      field: 'culture',
      value: fields.culture
    } ] );

    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function changePassword( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'new_password',
      min: 4
    } )
  ], { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'new_password',
      value: fields.new_password
    } ] );

    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function changeEmail( fields ) {

  var validateSet = setValidator( [
    email( {
      field: 'email'
    } ),
    text( {
      field: 'password'
    } )
  ], { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'email',
      value: fields.email
    }, {
      field: 'password',
      value: fields.password
    } ] );

    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}