"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - get', () => {

  const f = fixtures( config.mysql );

  let k, svc;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' ),
        getUserUidByEmail: require( './fixtures/getUserUidByEmail' )
      }
    } );

  } );

  after( f.destroyClient );

  describe( 'basic', () => {

    let member;

    before( async () => {

      member = await svc.get( { agendaUid: 1, userUid: 2 } );

    } );

    it( 'fetched member includes user and agenda uids', () => {

      _.pick( member, [ 'userUid', 'agendaUid' ] ).should.eql( {
        agendaUid: 1,
        userUid: 2
      } );

    } );

    it( 'fetched member includes role', () => {

      member.role.should.equal( 1 );

    } );

    it( 'by default, legacy fields are not provided', () => {

      should( member.credential ).equal( undefined );

    } );

    it( 'by default, user details is not provided', () => {

      should( member.user ).equal( undefined );

    } );

    it( 'when member is not found, returns null', async () => {

      const member = await svc.get( { agendaUid: 18839, userUid: 3 } );

      should( member ).equal( null );

    } );

    it( 'custom data is provided in custom key', () => {

      member.custom.should.eql( {
        organization: 'Idpt',
        contactNumber: '013072171',
        contactName: 'JC Ponceau',
        contactPosition: 'Responsable des pains',
        email: 'jc@ponceau.fr'
      } );

    } );

    it( 'member can also be fetched by agenda uid and member id', async () => {

      const member = await svc.get( { agendaUid: 2, id: 3 } );

      member.id.should.equal( 3 );

    } );

    it( 'by default, legacy fields are not provided', async () => {

      should( member.userId ).equal( undefined );
      should( member.agendaId ).equal( undefined );

    } );

    it( 'legacy fields are provided if legacy option is set to true', async () => {

      const member = await svc.get( { agendaUid: 1, userUid: 2 }, { legacy: true } );

      member.userId.should.equal( 81290 );
      member.agendaId.should.equal( 923 );

    } );

    it( 'user detail is provided when detailed option is set to true', async () => {

      const member = await svc.get( { agendaUid: 1, userUid: 2 }, { detailed: true } );

      member.user.should.eql( {
        id: 10293,
        uid: 1,
        fullName: 'Janine Ponceau'
      } );

    } );

    it( 'getByEmail looks in record store for queried email', async () => {

      const member = await svc.get.byEmail( { agendaUid: 1, email: 'janine@ponceau.fr' } );

      member.id.should.equal( 1 );

    } );

    it( 'getByEmail gets by email through interface when necessary', async () => {

      const member = await svc.get.byEmail( { agendaUid: 1, email: 'janeen@oa.com' } );

      member.id.should.equal( 4 );

    } );

  } );

} );
