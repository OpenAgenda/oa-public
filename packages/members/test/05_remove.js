"use strict";

const _ = require( 'lodash' );
const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const { promisify } = require( 'util' );

const Service = require( '../' );
const config = require( '../testconfig' );
const fixtures = require( './fixtures' );

describe( 'members - functional - remove', () => {

  const f = fixtures( config.mysql );

  let svc, result, onRemoveArgument;

  before( async () => {

    await f.load();

    svc = Service( {
      knex: f.client,
      interfaces: {
        getUsersByUid: require( './fixtures/getUsersByUid' ),
        getEventCountByUserUid: require( './fixtures/getEventCountByUserUid' ),
        onRemove: member => onRemoveArgument = member
      }
    } );

  } );

  before( async () => {
    result = await svc.remove( { userUid: 2, agendaUid: 1 } );
  } );

  after( f.destroyClient );

  it( 'simple remove removes', async () => {

    result.success.should.equal( true );

    const rows = await f.client( 'member' )
      .select( '*' )
      .where( { user_uid: 2, agenda_uid: 1 } );

    rows.length.should.equal( 0 );

  } );

  it( 'onRemove interface is given removed member', () => {

    _.pick( onRemoveArgument, [
      'userUid',
      'agendaUid'
    ] ).should.eql( {
      userUid: 2,
      agendaUid: 1
    } );

  } );

} );
