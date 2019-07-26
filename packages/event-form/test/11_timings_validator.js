"use strict";

import timingsValidator from '../src/validators/timings';

describe( 'event-form timings validator', () => {

  test( 'no timings provided gives validation error', () => {

    const validate = timingsValidator();

    try {

      validate();

    } catch ( validationErrors ) {

      expect( validationErrors ).toEqual( [ {
        code: 'timings.empty',
        message: 'At least one timing is required',
        field: 'timings'
      } ] );

    }

  } );

  test( 'if default is configured, default is used if no value is given', () => {

    const defaultValue = [ {
      begin: { date: '2019-10-12', hours: 10, minutes: 11 },
      end: { date: '2019-10-12', hours: 12, minutes: 20 }
    } ];

    const validate = timingsValidator( {
      default: defaultValue
    } );

    expect( validate() ).toEqual( defaultValue );

  } );

  test( 'flat timings are filtered out', () => {

    const validate = timingsValidator();

    const clean = validate( [ {
      begin: { date: '2019-10-12', hours: 10, minutes: 11 },
      end: { date: '2019-10-12', hours: 10, minutes: 11 }
    } ] );

    expect( clean.length ).toEqual( 0 );

  } );

} );
