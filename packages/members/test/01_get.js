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
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' )
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

  } );

} );
