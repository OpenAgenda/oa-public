"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const fs = require( 'fs' );
const knex = require( 'knex' );
const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );

describe( 'form-schemas -03- functional (server): remove', () => {

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
