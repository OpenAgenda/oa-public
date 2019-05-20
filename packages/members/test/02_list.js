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
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' )
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

    it( 'pagination works with "from" and "limit" keys', async () => {

      const query = { agendaUid: 1 };

      const first = await svc.list( query, { limit: 1 } );
      const second = await svc.list( query, { from: 2, limit: 1 } );

      first[ 0 ].id.should.equal( 1 );
      second[ 0 ].id.should.equal( 2 );

    } );

    it( 'pagination works with "offset" and "limit" keys', async () => {

      const second = await svc.list( { agendaUid: 1 }, { offset: 1, limit: 1 } );
      second[ 0 ].id.should.equal( 2 );

    } );

    it( 'provides a list in response', async () => {

      _.omit( members[ 0 ], [ 'createdAt', 'updatedAt' ] ).should.eql( {
        id: 1,
        agendaUid: 1,
        userUid: 1,
        role: 2,
        custom: {
          organization: 'Mairie de Saint-Germain-en-Laye',
          contactName: 'Janine Ponceau',
          contactNumber: '0130872171',
          contactPosition: 'Responsable de la diffusion artistique',
          email: 'janine@ponceau.fr'
        },
        deletedUser: false
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

    it( 'search looks in store field', async () => {

      const members = await svc.list( { agendaUid: 1, search: 'Janine' } );

      members[ 0 ].id.should.equal( 1 );
      members.length.should.equal( 1 );

    } );

    it( 'when detailed option is set to true, event count is provided for member', async () => {

      const members = await svc.list( { agendaUid: 1 }, { limit: 1 }, { detailed: true } );

      members[ 0 ].eventCount.should.equal( 12 );

    } );

    it( 'when total option is true, total is given in response', async () => {

      const {
        total,
        members
      } = await svc.list( { agendaUid: 1 }, { limit: 1 }, { total: true } );

      total.should.equal( 2 );

      members.length.should.equal( 1 );

    } );

    it( 'when legacy option is set to true, legacy values are provided', async () => {

      const { stakeholders } = await svc.list( { agendaUid: 1 }, { limit: 1 }, { legacy: true } );

      _.pick( stakeholders[ 0 ], [
        'agendaId',
        'credential',
        'userId',
        'actionsCounter'
      ] ).should.eql( {
        agendaId: 923,
        userId: 81289,
        credential: 2,
        actionsCounter: 12
      } );

    } );

  } );

} );
