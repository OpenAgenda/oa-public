"use strict";

var should = require( 'should' ),

validators = require( './build' );

describe( 'email validator', () => {

  var validate = validators.email( { field: 'email' } );

  it( 'is an email and is trimmed', () => {

    let clean = validate( ' kaore@cibul.net ' );

    clean.should.equal( 'kaore@cibul.net' );

  } );

  it( 'returns null if input is null and validaor is optional', () => {

    should( validators.email( { optional: true } )() ).equal( null );

  } );

  it( 'is not an email', () => {

    let caught = false;

    try {

      validate( 'fdsqf' );

    } catch( e ) {

      caught = true;

      e[ 0 ].code.should.equal( 'email.invalid' );

    }

  } );

  it( 'some long random string with an email does not validate', () => {

    let caught = false;

    try {

      validate( 'Amandine Plas ( chargéés de la com et du spons ) contacts: protable 06 33 09 49 72 email: usmelunhand@wanadoo.fr' );

    } catch( e ) {

      caught = true;

      e[ 0 ].code.should.equal( 'email.invalid' );

    }

    caught.should.equal( true );

  } );

  it( 'validate lists of emails', () => {

    let emails = [
      'kev@gmail.com',
      'in@gmail.com',
      'ber@gmail.com',
      'to@gmail.com',
      'mmier@gmail.com'
    ];

    validators.email( { list: true } )( emails )

    .should.eql( emails );

  } );

  it( 'validate lists of emails for non optional validator', () => {

    let emails = [
      
    ], errors = [];

    try {

      validators.email( { list: true, optional: false } )( [] );  

    } catch( e ) {

      errors = e;

    }

    errors.should.eql( [ { 
      field: undefined,
      code: 'list.required',
      message: 'list cannot be empty',
      origin: [] 
    } ] );

  } );

} );