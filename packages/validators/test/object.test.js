"use strict";

const validators = require( '../src' ), utils = require( '@openagenda/utils' );

describe( 'object validator', () => {

  describe( 'basic', () => {

    it( 'object validator can take in a list of validators as configuration. clean values are given as a list', () => {

      let validate = validators.object( [
        validators.text( { field: 'name', min: 3, max: 300 } ),
        validators.text( { field: 'code', min: 3, max: 20 } )
      ] ),

      cleanValue = validate( [ {
        field: 'name',
        value: 'Okay'
      }, {
        field: 'code',
        value: 'José'
      } ] );

      expect(cleanValue).toEqual([ {
        field: 'name',
        value: 'Okay'
      }, {
        field: 'code',
        value: 'José'
      } ]);

    } );

    it( 'errors are thrown as a list when validators are given as a list', () => {

      let validate = validators.object( [
        validators.text( { field: 'name', min: 3, max: 300 } ),
        validators.text( { field: 'code', min: 3, max: 20, optional: false } ) 
      ] ),

      errors = null;

      try {

        validate( [ {
          field: 'name',
          value: 1
        } ] );

      } catch( e ) {

        errors = e;

      }

      expect(errors).toEqual([ {
        field: 'name',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 3, max: 300 },
        origin: 1 
      }, {
        field: 'code',
        code: 'required',
        message: 'a string is required',
        origin: undefined 
      } ]);

    } );

  } );

  describe( 'inception', () => {

    let validate = validators.object( [
      validators.text( { field: 'name', min: 3 } ),
      validators.object( { field: 'details' }, [
        validators.email( { field: 'contact', optional: false } )
      ] )
    ] );

    it( 'clean values are always given in a flat array', () => {

      let clean = validate( [ {
        field: 'name',
        value: 'valid'
      }, {
        field: 'details',
        value: [ {
          field: 'contact',
          value: 'contact@email.com'
        } ]
      } ] );

      expect(clean).toEqual([ {
        field: 'name',
        value: 'valid'
      }, {
        field: 'details.contact',
        value: 'contact@email.com'
      } ]);


    } );

    it( 'errors are always given in a flat array', () => {

      let errors;

      try {

        validate( [ {
          field: 'name',
          value: 'f'
        }, {
          field: 'details',
          value: [ {
            field: 'contact',
            value: 'fdsqfdq'
          } ]
        } ] )

      } catch( e ) {

        errors = e;

      }

      expect(errors).toEqual([ {
        field: 'name',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 3, max: 1000000 },
        origin: 'f'
      }, {
        field: 'details.contact',
        code: 'email.invalid',
        message: 'email is not valid',
        origin: 'fdsqfdq'
      } ]);

    } );

  } );

} );