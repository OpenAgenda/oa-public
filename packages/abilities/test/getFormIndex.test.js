const abilities = require( '../src' );
const config = require( '../src/config' );
const testconfig = require( '../testconfig' );
const db = require( './utils/db' );

const database = `${testconfig.mysql.database}_getFormIndex`;

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

describe( 'getFormIndex', () => {
  test( 'simple getFormIndex for a user', async () => {
    const ability = await abilities.get( 'user', 99999999 );
    const index = await ability.getFormIndex();

    expect( index ).toMatchSnapshot();
  } );
} );
