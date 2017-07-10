"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  _ = require( 'lodash' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  fs = require( 'fs' ),

  knex = require( 'knex' );

describe( 'form-schemas - functional (server): remove', () => {

  before( done => {

    svc.initAndLoad( config, () => {

      done();

    } );

  } );

  after( () => {

    svc.shutdown();

  } );

  it( 'simple remove', async () => {

    let client = knex( { client: 'mysql', connection: config.mysql } );

    let { id } = await svc.create( { data: true } );

    ( await client( 'form_schema' ).where( { id } ) ).length.should.equal( 1 );

    ( await svc.remove( id ) ).should.eql( {
      success: true,
      id: id
    } );

    ( await client( 'form_schema' ).where( { id } ) ).length.should.equal( 0 );

    client.destroy();
  
  } );

} );