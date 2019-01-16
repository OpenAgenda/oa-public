"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const { promisify } = require( 'util' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/04.data.js' );

const Service = require( '../' );

describe( '04 - control data - rebuild', () => {

  let redisClient, knex, service;

  beforeAll( async () => {

    redisClient = await loadFixtures( config, fixtures );

    knex = knexLib( { client: 'mysql', connection: config.mysql } );

    service = Service( {
      knex,
      redis: redisClient,
      prefix: config.redisPrefix
    } );

  } );

  afterAll( async () => {

    await promisify( redisClient.del ).bind( redisClient )( config.redisPrefix + '83549053' );

    await promisify( redisClient.quit ).bind( redisClient )();

    await knex.destroy();

  } );

  test( 'rebuild', async () => {

    const data = await service.rebuild( 83549053 );

    expect( JSON.stringify( data, null, 2 ) ).toEqual(
      fs.readFileSync( __dirname + '/fixtures/redis/bordeaux-metropole.rebuilt.json', 'utf-8' ).trim( '\n' )
    );

  } );

} );
