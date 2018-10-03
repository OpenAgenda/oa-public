'use strict';

const abilities = require( '../' );
const config = require( '../config' );
const testconfig = require( '../testconfig' );
const db = require( './utils/db' );

const database = `${testconfig.mysql.database}_convertForForm`;

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

describe( 'convertForForm', () => {
  test( 'convert rules for a user form', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    console.log( JSON.stringify( ability.convertForForm(), null, 2 ) );
  } );
} );
