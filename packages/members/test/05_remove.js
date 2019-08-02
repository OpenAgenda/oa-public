"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - remove', () => {

  const f = fixtures( config.mysql );

  let svc, result, onRemoveArguments;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' ),
        onRemove: ( ...args ) => onRemoveArguments = args
      }
    } );

  } );

  before( async () => {
    result = await svc.remove( { userUid: 2, agendaUid: 1 }, {
      context: {
        user: { uid: 1920 }
      }
    } );
  } );

  after( f.destroyClient );

  it( 'simple remove removes', async () => {

    result.success.should.equal( true );

    const rows = await f.client( 'member' )
      .select( '*' )
      .where( { user_uid: 2, agenda_uid: 1 } );

    rows.length.should.equal( 0 );

  } );

  it( 'onRemove interface is given removed member and context', () => {

    onRemoveArguments.should.eql( [ {
      id: 2,
      deletedUser: false,
      invited: false,
      agendaUid: 1,
      role: 1,
      userUid: 2,
      custom:
       { organization: 'Idpt',
         contactNumber: '013072171',
         contactName: 'JC Ponceau',
         contactPosition: 'Responsable des pains',
         email: 'jc@ponceau.fr' }
    }, {
      user: { uid: 1920 }
    } ] );

  } );

} );
