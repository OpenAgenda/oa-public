"use strict";

const knex = require( 'knex' );
const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );

const Service = require( '..' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'networks - functional ( server ): update', function() {
  let k, svc, network;

   beforeAll( async () => {

    const con = mysql.createConnection( _.extend( _.pick( config.mysql, [ 'user', 'password' ] ), {
      multipleStatements: true,
      ssl: true,
    } ) );

    const query = promisify( con.query.bind( con ) );

    await query( fixtures );

    con.end();

  } );

  beforeAll( () => {
    k = knex( {
      client: 'mysql',
      connection: _.assign( {
        database: 'networktest'
      }, config.mysql )
    } );

    svc = Service( { knex: k } );
  } );

  beforeAll( async () => {
    network = await svc.update( 13, {
      title: 'Ville de Genève',
      formSchemaId: 123
    } );

    await svc.patch( 13, {
      formSchemaId: 456
    } );
  } );

  afterAll( () => {
    k.destroy();
  } );

  it( 'update returns updated network object', async () => {
    expect(network.title).toBe( 'Ville de Genève' );

    expect(network.uid).toBe( 13 );
  } );

  it( 'update commits network to db', async () => {
    const fromDb = await k( 'network' ).first( 'title' ).where( 'uid', 13 );

    expect(fromDb.title).toBe( 'Ville de Genève' );
  } );

  it( 'patch updates specified value only', async () => {
    const fromDb = await k( 'network' ).first( [ 'title', 'form_schema_id' ] ).where( 'uid', 13 );

    expect(fromDb.form_schema_id).toBe( 456 );
  } );
} );
