"use strict";

const validators = require( '../src' ), schema = require( '../src/schema' );

describe( 'schema validator', () => {

  describe( 'schema with few registered validators', () => {

    beforeAll( () => {

      schema.register( {
        link: validators.link
      } );

    } );

    it( 'validates an object with a basic schema', () => {

      let validate = schema( {
        uid: {
          type: 'integer'
        }
      } )

      try {

        validate( 123 );

      } catch ( e ) {

        expect(e.message).toBe('Unregistered type: integer');

      }

    } );

  } );

} );
