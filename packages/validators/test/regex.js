"use strict";

const should = require( 'should' ),

validators = require( '../' );

describe.only( 'regex validator', () => {

  var validate = validators.regex( { field: 'stars', regex: /\*/g } );

  it( 'matches', () => {

    let errors = [];

    try {

      validate( '***' );

    } catch ( e ) {

      errors = e;

    }

    errors.length.should.equal( 0 );

  } );

  it( 'does not match', () => {

    let errors = [];

    try { validate( '+++' ) } catch( e ) { errors = e; }

    errors.length.should.equal( 1 );

  } );

  it( 'cleans using regex', () => {

    let validate = validators.regex( { regex: /[^\/]+$/, clean: true } ),

    errors = [], clean = false;

    try { clean = validate( '/image/path.png' ); } catch( e ) { errors = e; }

    errors.length.should.equal( 0 );

    clean.should.equal( 'path.png' );

  } );

} );