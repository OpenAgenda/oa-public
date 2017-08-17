"use strict";

const should = require( 'should' ),

  validators = require( '../src' );

describe( 'ip validator', () => {

  const validate = validators.ip( { field: 'ip' } );

  it( 'is an ip', () => {

    let clean = validate( '191.168.0.1' );

    clean.should.equal( '191.168.0.1' );

  } );

  it( 'is not an ip', () => {

    let errors;

    try {

      validate( 'nimpornawak' );

    } catch ( e ) {

      errors = e;

    }

    errors.should.eql( [ { 
      origin: 'nimpornawak',
      field: 'ip',
      code: 'ip.invalid',
      message: 'ip address is invalid' 
    } ] );

  } );

  it( 'is a list of ips', () => {

    let validate = validators.ip( { field: 'ip', list: true } );

    validate( [
      '192.3.1.2',
      '192.12.0.1'
    ] ).should.eql( [
      '192.3.1.2',
      '192.12.0.1'
    ] );

  } );

} );