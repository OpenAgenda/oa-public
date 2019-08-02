"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - create', () => {

  const f = fixtures( config.mysql );

  let k, svc;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getAgendasByUid: require( './fixtures/getAgendasByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' )
      }
    } );

  } );

  after( f.destroyClient );

  it( 'simple create creates', async () => {

    const { member } = await svc.create( {
      userUid: 12,
      agendaUid: 31,
      role: 1,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        email: 'support@openagenda.com',
        contactPosition: 'Support'
      }
    } );

    _.omit( member, [ 'createdAt', 'updatedAt' ] ).should.eql( {
      id: 5,
      agendaUid: 31,
      userUid: 12,
      userId: 10293,
      reviewId: 919002,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        contactPosition: 'Support',
        email: 'support@openagenda.com'
      },
      invited: false,
      deletedUser: false,
      role: 1
    } );

  } );

  it( 'if member with same userUid and agendaUid already exists, error is thrown', async () => {

    let error = null;

    try {
      await svc.create( {
        userUid: 1,
        agendaUid: 1,
        role: 1
      }, { requireCustom: false } );
    } catch ( e ) {
      error = e;
    }

    error.message.should.equal( 'Already exists' );

  } );

  it( 'by default, custom data is required for create', async () => {

    const result = await svc.create( {
      userUid: 1,
      role: 2
    } );

    result.errors.length.should.equal( 5 );

  } );

  it( 'if requireCustom is false, custom data is optional', async () => {

    const result = await svc.create( {
      userUid: 1,
      role: 1
    }, { requireCustom: false } );

    result.errors.length.should.equal( 0 );

  } );

  it( 'if userUid is not specified at create, member is marked as invited', async () => {

    const result = await svc.create( {
      agendaUid: 123,
      role: 1
    }, { requireCustom: false } );

    result.member.invited.should.equal( true );

  } );

  it( 'if userUid is specified at create, member is not marked as invited', async () => {

    const { member } = await svc.create( {
      agendaUid: 123,
      userUid: 193,
      role: 1
    }, { requireCustom: false } );

    member.invited.should.equal( false );

  } );


} );
