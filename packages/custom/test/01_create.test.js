"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );

const schema = require( '@openagenda/validators/schema' );

const config = require( '../testconfig' );
const svc = require( './service' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' )
} );

describe( 'extended events - functional (server): create', function() {

  beforeEach( async () => {

    await svc.initAndLoad( ih( config, {
      interfaces: {
        getValidator: { $set: ( formSchemaId, options ) => {

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

    expect(result.success).toBe(true);

  } );

  it( 'create adds a record in db', done => {

    svc( 12345 ).create( 678, {
      edition: 14,
      contender: 'Jeff'
    } ).then( () => {

      const con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`, [ 12345, 678 ], ( err, rows ) => {

        con.end();

        expect(rows.length).toBe( 1 );

        done();

      } );

    } );

  } );

} );
