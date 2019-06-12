"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const should = require( 'should' );

const insee = require( '../utils/insee' );
const distance = require( '../utils/distance' );

const redisConfig = { host: 'localhost', port: 6379 };

const ns = 'insee';

const redisCli = require( 'redis' ).createClient( redisConfig.port, redisConfig.host );

const rcHGet = promisify( redisCli.hget.bind( redisCli ) );

describe( 'utils', () => {

  describe( 'insee', () => {

    before( () => {

      insee.init( { redis: redisConfig } );

    } );

    beforeEach( done => {

      // clear redis key
      redisCli.del( ns, done );

    } );

    it( 'retrieves insee reference', async () => {

      const ref = await insee( {
        city: 'Lamastre', // for caching
        department: 'Ardèche', // for caching ( name might be not enough )
        latitude: 44.9870015,
        longitude: 4.5737007
      } );

      ref.should.equal( '07129' );

    } );

    it( 'caches reference in redis', async () => {

      const before = await rcHGet( ns, 'ardeche|lamastre' );

      should( before ).equal( null );

      await insee( {
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      } );

      const after = await rcHGet( ns, 'ardeche|lamastre' );

      _.pick( _.first( JSON.parse( after ) ), [ 'nom', 'code' ] ).should.eql( {
        nom: 'Lamastre', code: '07129'
      } );

    } );

    it( 'uses cache at second call', async () => {

      await insee( {
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      } );

      insee.fromCache.should.equal( false );

      await insee( {
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      } );

      insee.fromCache.should.equal( true );

    } );

  } );

  describe( 'distance', () => {

    it( 'gets the distance in meters', () => {

      const d = distance( {
        name: 'La boutique',
        latitude: 48.867622,
        longitude: 2.352210
      }, {
        name: 'La Gaité Lyrique',
        latitude: 48.866771,
        longitude: 2.353651
      } );

      d.should.equal( 142 );

    } );

  } );

} );
