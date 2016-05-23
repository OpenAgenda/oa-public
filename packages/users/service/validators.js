"use strict";

const setValidator = require( 'validators/set' ),

  text = require( 'validators/text' ),

  email = require( 'validators/email' ),

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
      field: 'full_name'
    } ),
    text( {
      field: 'culture',
      min: 2,
      max: 2
    } ),
    email( {
      field: 'email'
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
    } ] );


    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function update( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'full_name'
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
      field: 'store'
    } )
  ].filter( v => Object.keys( fields ).indexOf( v.field ) !== -1 ), { compact: true } );

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
    }, {
      field: 'store',
      value: fields.store
    } ] );

    return { valid: true, fields: result };

  } catch ( e ) {

    return { valid: false, errors: e };

  }

}

function updateProfile( fields ) {

  var validateSet = setValidator( [
    text( {
      field: 'full_name'
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
      field: 'password',
      min: 4
    } )
  ], { compact: true } );

  try {

    var result = validateSet( [ {
      field: 'password',
      value: fields.password
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