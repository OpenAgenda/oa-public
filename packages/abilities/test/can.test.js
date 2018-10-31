import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_can`;
testconfig.mysql.database = database;

beforeAll( async () => {
  await db.create( testconfig.mysql );

  abilities.init( testconfig );

  await abilities.config.migrate();
} );

beforeEach( async () => {
  await abilities.config.seed( 'firstTest' );
} );

afterAll( async () => {
  await abilities.config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await abilities.config.knex.destroy();
} );

describe( 'can', () => {
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

  test( 'compose ability for a member entity (agenda + user + member)', async () => {
    const ability = await abilities.get( 'member', 60815 );

    expect( ability.can( 'receive', 'activity' ) ).toBe( true );
    expect( ability.can( 'receive', 'activity', { verb: 'spam' } ) ).toBe( false );
    expect(
      ability.can( 'receive', 'mail', { verb: 'agenda.eventPublished' } )
    ).toBe( true );
  } );

  test( 'check abilities that have opposed rules but the same user entity', async () => {
    const userAbility = await abilities.get( 'user', 99999999 );
    const memberAbility = await abilities.get( 'member', 60815 );

    expect( userAbility.can( 'receive', 'eventUpdate' ) ).toBe( true );
    expect( memberAbility.can( 'receive', 'eventUpdate' ) ).toBe( false );
  } );
} );
