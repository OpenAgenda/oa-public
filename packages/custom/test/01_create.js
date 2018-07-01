"use strict";

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

describe( 'extended events - functional (server): create', function() {

  this.timeout( 4000 );

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

  it( 'create the simplest extended event gives a success response', async () => {

    const result = await svc( 3819893 ).create( 123, {
      edition: 12,
      contender: 'steve'
    } );

    result.success.should.equal( true );

  } );

  it( 'create adds a record in db', done => {

    svc( 12345 ).create( 678, {
      edition: 14,
      contender: 'Jeff'
    } ).then( () => {

      const con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`, [ 12345, 678 ], ( err, rows ) => {

        con.end();

        rows.length.should.equal( 1 );

        done();

      } );

    } );

  } );

} );