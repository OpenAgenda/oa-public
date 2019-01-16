"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const knexLib = require( 'knex' );

const config = require( '../testconfig' );

const loadFixtures = require( './fixtures/load' );
const fixtures = require( './fixtures/01.data.js' );

const Service = require( '../' );

describe( '01 - control data - insert', () => {

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

    await promisify( redisClient.del ).bind( redisClient )( config.redisPrefix + '123' );

    await promisify( redisClient.quit ).bind( redisClient )();

    await knex.destroy();

  } );

  describe( 'simple insert', () => {

    const aeRef = {
      agendaUid: 123,
      eventUid: 1,
      legacyId: '1.1'
    };

    let inserted;

    beforeAll( async () => {

      inserted = await service.insert( aeRef, {
        uid: 1,
        slug: 'an-event',
        timezone: 'Europe/Paris',
        locationUid: 123,
        location: {
          uid: 95669829,
          latitude: 44.854797,
          longitude: -0.568099
        },
        timings: [ {
          begin: new Date( '2018-12-20T10:15:00+0400' ),
          end: new Date( '2018-12-20T12:00:00+0400' )
        } ]
      } );

    } );

    test( 'result contains inserted event', () => {

      expect( _.pick( inserted.event, [ 'u', 's', 'tz', 'l', 'd', 'c', 't' ] ) )
        .toEqual( {
          u: 1,
          s: 'an-event',
          tz: 'Europe/Paris',
          l: 123,
          d: [ '2018-12-20' ],
          t: [ 'photographie', 'peinture' ],
          c: 'exposition'
        } );

    } );

    test( 'when location was not in control data, it is parsed and is included in response', () => {

      expect( inserted.location ).toEqual( {
        u: 95669829,
        lt: 44.854797,
        lg: -0.568099
      } );

    } );

    test( 'event data is in redis under right agenda key', done => {

      redisClient.get( config.redisPrefix + '123', ( err, stored ) => {

        expect( _.pick( JSON.parse( stored ).ev[ 0 ], [ 'u', 's', 'tz', 'l', 'd', 'c', 't' ] ) )
          .toEqual( {
            u: 1,
            s: 'an-event',
            tz: 'Europe/Paris',
            l: 123,
            d: [ '2018-12-20' ],
            t: [ 'photographie', 'peinture' ],
            c: 'exposition'
          } );

        done();

      } );

    } );

  } );


  describe( 'miscellaneous', () => {

    const aeRef = {
      agendaUid: 123,
      eventUid: 2,
      legacyId: '1.2'
    };

    let inserted, updatedCtlData;

    beforeAll( async () => {

      inserted = await service.insert( aeRef, {
        uid: 2,
        slug: 'another-event',
        timezone: 'Europe/Paris',
        locationUid: 123,
        location: {
          uid: 95669829,
          latitude: 44.854797,
          longitude: -0.568099
        },
        timings: [ {
          begin: new Date( '2018-12-20T10:15:00+0400' ),
          end: new Date( '2018-12-20T12:00:00+0400' )
        } ]
      } );

      updatedCtlData = JSON.parse( await promisify( redisClient.get ).bind( redisClient )( config.redisPrefix + '123' ) );

    } );

    test( 'if member has organization info, it is stored in control data entry', () => {

      expect( inserted.event.org ).toEqual( {
        l: 'Ville de Bassens',
        s: 'ville-de-bassens'
      } );

    } );

    test( 'if no last occurrence was defined, it is set with insert', () => {

      expect( updatedCtlData.lo.start ).toBe( '2018-12-20T06:15:00.000Z' )

    } );

    test( 'clear removes control data from redis', async () => {

      await service.clear( 123 );

      const data = await promisify( redisClient.get ).bind( redisClient )( config.redisPrefix + '123' );

      expect( data ).toBe( null );

    } );

  } );


} );
