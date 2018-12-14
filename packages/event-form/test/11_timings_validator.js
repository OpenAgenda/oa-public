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
      begin: new Date( '2018-12-14-11:45:00.000+0400' ),
      end: new Date( '2018-12-14-12:00:00.000+0400' )
    } ];

    const validate = timingsValidator( {
      default: defaultValue
    } );

    expect( validate() ).toEqual( defaultValue );

  } );

} );
