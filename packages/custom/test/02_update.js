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

describe( 'extended events - functional (server): update', function() {

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

  it( 'update the simplest extended event gives a success response', async () => {

    let result = await svc( 3819893 ).create( 123, {
      edition: 12,
      contender: 'steve'
    } );

    result = await svc( 3819893 ).update( 123, {
      edition: 13,
      contender: 'bob'
    } );

    result.success.should.equal( true );

  } );

  it( 'update updates a record in db', done => {

    svc( 12345 ).create( 678, {
      edition: 14,
      contender: 'Jeff'
    } ).then( () => {

      return svc( 12345 ).update( 678, {
        edition: 15,
        contender: 'Janine'
      } );

    } ).then( () => {

      let con = mysql.createConnection( config.mysql );

      con.query( `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`, [ 12345, 678 ], ( err, rows ) => {

        con.end();

        rows.length.should.equal( 1 );

        JSON.parse( rows[ 0 ].store ).contender.should.equal( 'Janine' );

        done();

      } );

    } );

  } );

} );