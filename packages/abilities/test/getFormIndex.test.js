import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_getFormIndex`;
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

describe( 'getFormIndex', () => {
  test( 'simple getFormIndex for a user', async () => {
    const ability = await abilities.get( 'user', 99999999 );
    const index = await ability.getFormIndex();

    expect( index ).toMatchSnapshot();
  } );

  test( 'simple getFormIndex for an agenda', async () => {
    const ability = await abilities.get( 'agenda', 48959239 );
    const index = await ability.getFormIndex();

    expect( index ).toMatchSnapshot();
  } );
} );
