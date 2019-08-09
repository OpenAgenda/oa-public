"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - patch', () => {

  const f = fixtures( config.mysql );

  let svc, onPatchArguments;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getAgendasByUid: require( './fixtures/getAgendasByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' ),
        onPatch: ( before, after, context ) => onPatchArguments = { before, after, context }
      }
    } );

  } );

  after( f.destroyClient );

  describe( 'simple patch', async () => {

    let result;

    before( async () => {

      result = await svc.patch( { userUid: 2, agendaUid: 1 }, {
        custom: {
          organization: 'OpenAgenda',
          contactNumber: '06 50 91 60 26',
          contactName: 'Gaetan',
          contactPosition: 'Support',
          email: 'kaore@openagenda.com'
        }
      }, {
        context: {
          lang: 'fr'
        }
      } );

    } );

    it( 'provided field is updated', async () => {

      const member = await svc.get( { userUid: 2, agendaUid: 1 } );

      member.custom.should.eql( {
        organization: 'OpenAgenda',
        contactNumber: '06 50 91 60 26',
        contactName: 'Gaetan',
        contactPosition: 'Support',
        email: 'kaore@openagenda.com'
      } );

    } );

    it( 'legacy fields are provided in result', () => {

      result.member.userId.should.equal( 81290 );

    } );

    it( 'interface provides member before and after patch', () => {

      const { before, after } = onPatchArguments;

      before.custom.contactName.should.equal( 'JC Ponceau' );
      after.custom.contactName.should.equal( 'Gaetan' );

    } );

    it( 'if context is provided in patch options it is passed to interface', () => {

      const { context } = onPatchArguments;

      context.should.eql( {
        lang: 'fr',
        sender: {
          memberName: null,
          userUid: null
        }
      } );

    } );

  } );

  it( 'if user identifier is specified in patch, legacy is updated', async () => {

    const { member } = await svc.patch( { userUid: 1, agendaUid: 2 }, { userUid: 3 } );

    member.userId.should.equal( 10293 );

  } );

  it( 'if agenda identifier is specified in patch, legacy is updated', async () => {

    const { member } = await svc.patch( { userUid: 1, agendaUid: 1 }, { agendaUid: 12 } );

    member.agendaId.should.equal( 919002 );

  } );

  it( 'deletedUser can be patched', async () => {

    const { member } = await svc.patch( { userUid: 2, agendaUid: 1 }, { deletedUser: true } );

    member.deletedUser.should.equal( true );

  } );

} );
