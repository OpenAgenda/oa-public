"use strict";

const validators = require( '../src' );

describe( 'ip validator', () => {

  const validate = validators.ip( { field: 'ip' } );

  it( 'is an ip', () => {

    let clean = validate( '191.168.0.1' );

    expect(clean).toBe('191.168.0.1');

  } );

  it( 'is not an ip', () => {

    let errors;

    try {

      validate( 'nimpornawak' );

    } catch ( e ) {

      errors = e;

    }

    expect(errors).toEqual([ { 
      origin: 'nimpornawak',
      field: 'ip',
      code: 'ip.invalid',
      message: 'ip address is invalid' 
    } ]);

  } );

  describe( 'lists', () => {

    const validate = validators.ip( { field: 'ip', list: true } );

    it( 'is a list of ips', () => {

      expect(validate( [
        '192.3.1.2',
        '192.12.0.1'
      ] )).toEqual([
        '192.3.1.2',
        '192.12.0.1'
      ]);

    } );

    it( 'nothing given to list returns an empty list', () => {

      expect(validate()).toEqual([]);

    } );

    it( 'null given to list returns an empty list', () => {

      expect(validate( null )).toEqual([]);

    } );

  } );

} );