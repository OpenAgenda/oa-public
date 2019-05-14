"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - list', () => {

  let k, svc;

   before( async () => {

    const con = mysql.createConnection( _.assign( _.pick( config.mysql, [ 'user', 'password' ] ), {
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
        database: 'memberstest'
      }, config.mysql )
    } );

    svc = Service( {
      knex: k,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' )
      }
    } );

  } );

  after( () => {

    k.destroy();

  } );

  describe( 'basic', () => {

    let members;

    before( async () => {

      members = await svc.list( { agendaUid: 1 }, { limit: 1 } );

    } );

    it( 'length matches specified limit', async () => {

      members.length.should.equal( 1 );

    } );

    it( 'provides a list in response', async () => {

      _.omit( members[ 0 ], [ 'createdAt', 'updatedAt' ] ).should.eql( {
        id: 1,
        agendaUid: 1,
        userUid: 1,
        role: 2
      } );

    } );

    it( 'by default, user details are not provided', async () => {

      should( members[ 0 ].user ).equal( undefined );

    } );

  } );

  describe( 'other', () => {

    it( 'when detailed option is set to true, user details are provided', async () => {

      const members = await svc.list( { agendaUid: 1 }, { limit: 1 }, { detailed: true } );

      members[ 0 ].user.should.eql( {
        uid: 1,
        fullName: 'Janine Ponceau'
      } );

    } );

    it( 'when legacy option is set to true, legacy fields are provided', async () => {


    } );

  } );

} );
