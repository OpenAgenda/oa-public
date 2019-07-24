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

  it( 'simple remove removes', async () => {

    const { success } = await svc.remove( { userUid: 2, agendaUid: 1 } );

    success.should.equal( true );

    const rows = await f.client( 'member' )
      .select( '*' )
      .where( { user_uid: 2, agenda_uid: 1 } );

    rows.length.should.equal( 0 );

  } );

} );
