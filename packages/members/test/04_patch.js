"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - patch', () => {

  const f = fixtures( config.mysql );

  let svc;

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

  it( 'simple patch patches', async () => {

    const { member } = await svc.patch( { userUid: 2, agendaUid: 1 }, {
      custom: {
        organization: 'OpenAgenda',
        contactNumber: '06 50 91 60 26',
        contactName: 'Gaetan',
        contactPosition: 'Support',
        email: 'kaore@openagenda.com'
      }
    } );

    _.omit( member, [ 'updatedAt' ] ).should.eql( {
      id: 2,
      deletedUser: false,
      invited: false,
      agendaUid: 1,
      role: 1,
      userUid: 2,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '06 50 91 60 26',
        contactPosition: 'Support',
        email: 'kaore@openagenda.com'
      }
    } );

  } );

} );
