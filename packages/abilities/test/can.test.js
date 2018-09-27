'use strict';

const { expect } = require( 'chai' );
const abilities = require( '../' );
const config = require( '../config' );
const testconfig = require( '../testconfig' );
const createDb = require( './createDb' );

const database = `${testconfig.mysql.database}_can`;

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

describe( 'Ability.can', () => {
  test( 'simple can', async () => {
    const ability = await abilities.get( 'user', 99999999 );

    expect( ability.can( 'receive', 'activity' ) ).to.be.true;
    expect( ability.can( 'create', 'event' ) ).to.be.true;
    expect( ability.can( 'remove', 'event' ) ).to.be.false;
  } );

  test( 'can without rule', async () => {
    const ability = await abilities.get( 'user', 123 );

    expect( ability.can( 'receive', 'activity' ) ).to.be.true;
  } );

  test( 'can with conditions', async () => {
    const ability = await abilities.get( 'user', 12345678 );

    expect( ability.can( 'receive', 'activity' ) ).to.be.true;
    expect( ability.can( 'receive', 'activity', { verb: 'spam' } ) ).to.be.false;
    expect( ability.can( 'receive', 'activity', { verb: 'spam', target: 'agenda:654' } ) ).to.be.false;
    expect( ability.can( 'receive', 'activity', { verb: 'spam', target: 'agenda:456' } ) ).to.be.false;
  } );
} );
