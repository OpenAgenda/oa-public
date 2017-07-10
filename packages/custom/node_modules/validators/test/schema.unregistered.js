"use strict";

require( 'source-map-support' ).install();

const validators = require( '../' ),

  schema = require( '../src/schema' ),

  should = require( 'should' );

describe( 'schema validator', () => {

  describe( 'schema with few registered validators', () => {

    before( () => {

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

        e.message.should.equal( 'Unregistered type: integer' );

      }

    } );

  } );

} );