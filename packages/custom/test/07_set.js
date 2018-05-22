"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  _ = require( 'lodash' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  mysql = require( 'mysql' ),

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

    result.success.should.equal( true );

    result.operation.should.equal( 'create' );

    const result2 = await svc( 3819893 ).set( 123, {
      edition: 12,
      contender: 'bob'
    } );

    result2.success.should.equal( true );

    result2.operation.should.equal( 'update' );

  } );

} );