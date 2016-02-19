"use strict";

var should = require( 'should' ),

validators = require( '../' );

describe( 'email validator', () => {

  var validate = validators.email( { field: 'email' } );

  it( 'is an email and is trimmed', () => {

    let clean = validate( ' kaore@cibul.net ' );

    clean.should.equal( 'kaore@cibul.net' );

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

} );