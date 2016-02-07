"use strict";

var should = require( 'should' ),

validators = require( '../' );

describe( 'phone validator', () => {

  var validate = validators.phone( { field: 'telephone' } );

  it( 'a phone number with spaces is a phone number', () => {

    let clean = validate( '06 50 91 60' );

    clean.should.equal( '06 50 91 60' );

  } );

  it( 'is a phone and is trimmed', () => {

    let clean = validate( ' 06509160 ' );

    clean.should.equal( '06509160' );

  } );

  it( 'is not a phone', () => {

    let caught = false;

    try {

      validate( 'fdsqf' );

    } catch( e ) {

      caught = true;

      e[ 0 ].code.should.equal( 'phone.invalid' );

      e[ 0 ].field.should.equal( 'telephone' ); 

    }

  } );

} );