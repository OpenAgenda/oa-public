"use strict";

const knex = require( 'knex' );
const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'networks - functional ( server ): create', function() {

  let k, svc, network;

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

  before( async () => {

    network = await svc.create( { title: 'Reykjavik Métropole' } );

  } );

  after( () => {

    k.destroy();

  } );

  it( 'create returns created network object', async () => {

    network.title.should.equal( 'Reykjavik Métropole' );

    network.uid.should.greaterThan( 0 );

  } );

  it( 'create commits network to db', async () => {

    const fromDb = await k( 'network' ).first( 'title' ).where( 'uid', network.uid );

    fromDb.title.should.equal( 'Reykjavik Métropole' );

  } );

} );
