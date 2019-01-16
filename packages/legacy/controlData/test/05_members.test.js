"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/05.data.js' );

const Service = require( '../' );

describe( '05 - control data - members', () => {

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

    await promisify( redisClient.del ).bind( redisClient )( config.redisPrefix + '789' );

    await promisify( redisClient.quit ).bind( redisClient )();

    await knex.destroy();

  } );

  describe( 'insert and remove', () => {

    test( 'set adds user uid to control data', async () => {

      await service.memberSet( { agendaUid: 789, userUid: 1, role: 1 } );

      const updatedCtlData = JSON.parse( await promisify( redisClient.get ).bind( redisClient )( config.redisPrefix + '789' ) );

      expect( updatedCtlData ).toEqual( { ev: [], l: [], e: [ 1 ] } );

    } );

    test( 'remove removes user uid from control data', async () => {

      await service.memberSet( { agendaUid: 789, userUid: 1, role: 1 } );

      await service.memberRemove( { agendaUid: 789, userUid: 1 } );

      const updatedCtlData = JSON.parse( await promisify( redisClient.get ).bind( redisClient )( config.redisPrefix + '789' ) );

      expect( updatedCtlData ).toEqual( { ev: [], l: [], e: [] } );

    } );

  } );


} );
