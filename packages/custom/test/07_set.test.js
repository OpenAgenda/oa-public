"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  config = require( '../testconfig' ),

  schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' )
} );

describe( 'extended events - functional (server): set', function() {

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

  it( 'set the simplest extended event gives a success response and the type of operation made', async () => {

    const result = await svc( 3819893 ).set( 123, {
      edition: 12,
      contender: 'steve'
    } );

    expect(result.success).toBe(true);

    expect(result.operation).toBe( 'create' );

    const result2 = await svc( 3819893 ).set( 123, {
      edition: 12,
      contender: 'bob'
    } );

    expect(result2.success).toBe(true);

    expect(result2.operation).toBe( 'update' );

  } );

} );