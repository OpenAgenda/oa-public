const abilities = require( '../src' );
const config = require( '../src/config' );
const testconfig = require( '../testconfig' );
const db = require( './utils/db' );

const database = `${testconfig.mysql.database}_get`;

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

describe( 'get', () => {
  test( 'simple get for a user', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    expect( ability.rules ).toMatchSnapshot();
  } );

  test( 'get with a bad identifier object should throw an error', async () => {
    await expect( abilities.get( 'user', {} ) ).rejects.toThrow( '`identifier` should be a number' );
  } );
} );
