"use strict";

process.env.NODE_ENV = 'test';

const  _ = require( 'lodash' ),

  svc = require( './service' ),

  ih = require( 'immutability-helper' ),

  mysql = require( 'mysql' ),

  config = require( '../testconfig' ),

  schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' )
} );

describe( 'extended events - functional (server): remove', function() {

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

  beforeEach( async () => {

    await svc( 12 ).create( 123, {
      edition: 12,
      contender: 'Phteve'
    } );

  } );

  it( 'remove custom data by form schema id and identifier', async () => {

    expect( await svc( 12 ).remove( 123 ) ).toEqual( {
      success: true,
      removed: {
        contender: 'Phteve',
        edition: 12
      }
    } );

  } );

  it( 'remove effectively removes', done => {

    svc( 12 ).remove( 123 ).then( () => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`, [ 12, 123 ], ( err, rows ) => {

        con.end();

        expect(rows.length).toBe( 0 );

        done();

      } );

    } );

  } );

} );