'use strict';

const abilities = require( '../' );
const config = require( '../config' );
const testconfig = require( '../testconfig' );
const db = require( './utils/db' );

const database = `${testconfig.mysql.database}_can`;

beforeAll( async () => {
  await db.create( { ...testconfig.mysql, database } );

  abilities.init( db.getConfig( testconfig, database ) );

  await abilities.db.migrate();
} );

beforeEach( async () => {
  await abilities.db.seed( 'firstTest' );
} );

afterAll( async () => {
  await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await config.knex.destroy();
} );

describe( 'Ability.can', () => {
  test( 'simple can', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    expect( ability.can( 'receive', 'activity' ) ).toBe( true );
    expect( ability.can( 'create', 'event' ) ).toBe( true );
    expect( ability.can( 'remove', 'event' ) ).toBe( false );
  } );

  test( 'can with only default rules', async () => {
    const ability = await abilities.get( 'user', 123 );

    expect( ability.can( 'receive', 'activity' ) ).toBe( true );
  } );

  test( 'can with conditions', async () => {
    const ability = await abilities.get( 'user', 12345678 );

    expect( ability.can( 'receive', 'activity' ) ).toBe( true );
    expect( ability.can( 'receive', 'activity', { verb: 'spam' } ) ).toBe( false );
  } );

  test( 'compose ability for a user entity (agendas + user + members)', async () => {
    const ability = await abilities.get( 'user', 12345678 );

    expect( ability.can( 'receive', 'activity' ) ).toBe( true );
    expect( ability.can( 'receive', 'activity', { verb: 'spam' } ) ).toBe( false );
    expect( ability.can( 'receive', 'mail', { verb: 'agenda.eventPublished' } ) ).toBe( true );
  } );

  test( 'check ability for a member from a subpart of a user', async () => {
    const userAbility = await abilities.get( 'user', 99999999 );
    const memberAbility = await abilities.get( 'member', 60815 );

    expect( userAbility.can( 'receive', 'eventUpdate' ) ).toBe( true );
    expect( memberAbility.can( 'receive', 'eventUpdate' ) ).toBe( false );

    // user can receive eventUpdate
    // member cannot receive eventUpdate

    // userAbility.can( 'receive', 'eventUpdate' ) === true
    // userAbility.for( 'member', 60815 ).can( 'receive', 'eventUpdate' )
  } );
} );
