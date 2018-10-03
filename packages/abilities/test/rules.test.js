'use strict';

const abilities = require( '../' );
const config = require( '../config' );
const testconfig = require( '../testconfig' );
const db = require( './utils/db' );

const database = `${testconfig.mysql.database}_rules`;

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

describe( 'rules', () => {
  test( 'none', () => {
    //
  } );
} );
