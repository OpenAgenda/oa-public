import abilities from '../src/service';
import testconfig from '../testconfig';
import db from './utils/db';

const database = `${testconfig.mysql.database}_rules`;
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

describe( 'rules', () => {
  test( 'none', () => {
    //
  } );
} );
