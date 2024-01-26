"use strict";

process.env.NODE_ENV = 'test';

const  _ = require( 'lodash' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  config = require( '../testconfig' ),

  schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' )
} );

describe( 'extended events - functional (server): get', function() {

  beforeEach( async () => {

    await svc.initAndLoad( ih( config, {
      interfaces: {
        getValidator: { $set: formSchemaId => {

          return schema( {
            edition: {
              type: 'integer'
            },
            contender: {
              type: 'text'
            }
          } );

        } }
      }
    } ) );

  } );

  it( 'get custom data by form schema id and identifier', async () => {

    await svc( 12 ).create( 123, {
      edition: 12,
      contender: 'Phteve'
    } );

    expect( await svc( 12 ).get( 123 ) ).toEqual( {
      edition: 12,
      contender: 'Phteve'
    } );

  } );

} );