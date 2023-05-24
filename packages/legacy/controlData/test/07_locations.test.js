"use strict";

const _ = require( 'lodash' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/07.data.js' );

const Service = require( '../' );

describe( '07 - control data - locations', () => {

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

    await redisClient.del( config.redisPrefix + '789' );

    await redisClient.quit();

    await knex.destroy();

  } );

  describe( 'insert and remove', () => {

    test( 'set adds location to control data', async () => {

      await service.locationSet( { agendaUid: 789, location: {
        uid: 1,
        latitude: 45,
        longitude: 47
      } } );

      const updatedCtlData = JSON.parse( await redisClient.get( config.redisPrefix + '789' ) );

      expect( updatedCtlData ).toEqual( {
        ev: [],
        l: [ {
          u: 1, lt: 45, lg: 47
        } ]
      } );

    } );

    test( 'set updates location in control data', async () => {

      await service.locationSet( { agendaUid: 101, location: {
        uid: 2,
        latitude: 49,
        longitude: 50
      } } );

      const updatedCtlData = JSON.parse( await redisClient.get( config.redisPrefix + '101' ) );

      expect( updatedCtlData ).toEqual( {
        ev: [],
        l: [ {
          u: 2, lt: 49, lg: 50
        } ]
      } );

    } );

    test( 'remove removes location from control data', async () => {

      const updatedCtlDataBefore = JSON.parse( await redisClient.get( config.redisPrefix + '666' ) );

      expect( updatedCtlDataBefore ).toEqual( {
        ev: [],
        l: [ { u: 3, lt: 45, lg: 47 } ]
      } );

      await service.locationRemove( { agendaUid: 666, locationUid: 3 } );

      const updatedCtlDataAfter = JSON.parse( await redisClient.get( config.redisPrefix + '666' ) );

      expect( updatedCtlDataAfter ).toEqual( {
        ev: [],
        l: []
      } );

    } );

  } );


} );
