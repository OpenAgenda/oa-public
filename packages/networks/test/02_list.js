"use strict";

const knex = require( 'knex' );
const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'networks - functional ( server ): get', function() {

  let k, svc;

   before( async () => {

    const con = mysql.createConnection( _.extend( _.pick( config.mysql, [ 'user', 'password' ] ), {
      multipleStatements: true
    } ) );

    const query = promisify( con.query.bind( con ) );

    const result = await query( fixtures );

    con.end();

  } );

  before( () => {

    k = knex( {
      client: 'mysql',
      connection: _.assign( {
        database: 'networktest'
      }, config.mysql )
    } );

    svc = Service( { knex: k } );

  } );

  after( () => {

    k.destroy();

  } );

  it( 'list lists', async () => {

    ( await svc.list() ).map( n => _.pick( n, [ 'uid', 'formSchemaId', 'title' ] ) )
      .should.eql( [ {
        uid: 1,
        formSchemaId: 2,
        title: 'Métropole de Toulouse'
      }, {
        uid: 13,
        formSchemaId: 12,
        title: 'Métropole de Lille'
      }, {
        uid: 3,
        formSchemaId: 21,
        title: 'Orléans Métropole'
      } ] );

  } );

} );
