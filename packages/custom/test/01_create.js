"use strict";

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

describe( 'extended events - functional (server): create', function() {

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

  it( 'create the simplest extended event', async () => {

    let result = await svc( 3819893 ).create( 123, {
      edition: 12,
      contender: 'steve'
    } );

  } );

} );