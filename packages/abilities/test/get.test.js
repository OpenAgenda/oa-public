'use strict';

const { expect } = require( 'chai' );
const abilities = require( '../' );
const config = require( '../config' );
const testconfig = require( '../testconfig' );
const createDb = require( './createDb' );

const database = `${testconfig.mysql.database}_get`;

beforeEach( async () => {
  await createDb( database );

  abilities.init( {
    ...testconfig,
    mysql: { ...testconfig.mysql, database }
  } );

  await abilities.db.migrate();

  await abilities.db.seed();
} );

afterEach( async () => {
  await config.knex.raw( `DROP DATABASE IF EXISTS ${database}` );
  await config.knex.destroy();
} );

describe( 'get', () => {
  test( 'simple get of an ability instance for a user', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    // TODO fix this

    expect( ability.rules ).to.include.deep.members( [
      {
        actions: 'create',
        subject: 'event',
        inverted: false,
        conditions: null,
        fields: null,
        reason: null
      },
      {
        actions: 'receive',
        subject: 'activity',
        inverted: false,
        conditions: null,
        fields: null,
        reason: null
      }
    ] );
  } );

  test( 'get with an empty entity object should throw an error', async () => {
    await expect( abilities.get( 'user', {} ) ).to.be.rejectedWith( TypeError, '`identifier` should be a number' );
  } );
} );
