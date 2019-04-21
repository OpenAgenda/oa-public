"use strict";

const knex = require( 'knex' );
const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'networks - functional ( server ): update', function() {

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

    network = await svc.update( 13, { title: 'Ville de Genève' } );

  } );

  after( () => {

    k.destroy();

  } );

  it( 'update returns updated network object', async () => {

    network.title.should.equal( 'Ville de Genève' );

    network.uid.should.equal( 13 );

  } );

  it( 'update commits network to db', async () => {

    const fromDb = await k( 'network' ).first( 'title' ).where( 'uid', 13 );

    fromDb.title.should.equal( 'Ville de Genève' );

  } );

} );
