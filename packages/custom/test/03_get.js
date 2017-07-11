"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  _ = require( 'lodash' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  mysql = require( 'mysql' ),

  config = require( '../testconfig' ),

  schema = require( 'validators/schema' );

schema.register( {
  integer: require( 'validators/integer' ),
  text: require( 'validators/text' )
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

    ( await svc( 12 ).get( 123 ) ).should.eql( {
      edition: 12,
      contender: 'Phteve'
    } );

  } );

} );