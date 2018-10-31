import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_get`;
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

describe( 'get', () => {
  test( 'simple get for a user', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    expect( ability.rules ).toMatchSnapshot();
  } );

  test( 'get with a bad identifier object should throw an error', async () => {
    await expect( abilities.get( 'user', {} ) ).rejects.toThrow(
      '`identifier` should be a number'
    );
  } );
} );
