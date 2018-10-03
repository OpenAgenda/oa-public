"use strict";

const knex = require( 'knex' );
const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );

const svc = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures/01' );

describe( 'network - functional ( server ): get', function() {

  let k;

   beforeAll( async () => {

    const con = mysql.createConnection( _.extend( _.pick( config.mysql, [ 'user', 'password' ] ), {
      multipleStatements: true
    } ) );

    const query = promisify( con.query.bind( con ) );

    const result = await query( fixtures );

    con.end();

  } );

  beforeAll( () => {

    k = knex( {
      client: 'mysql',
      connection: _.assign( {
        database: 'networktest'
      }, config.mysql )
    } );

    svc.init( { knex: k } );

  } );

  afterAll( () => {

    k.destroy();

  } );

  test( 'get gets it', async () => {

    expect( await svc.get( 1 ) ).toEqual( {
      uid: 1, 
      formSchemaId: 2, 
      title: 'Métropole de Toulouse' 
    } );

  } );

} );
