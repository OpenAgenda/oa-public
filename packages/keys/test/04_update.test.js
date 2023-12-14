"use strict";

const _ = require( 'lodash' );
const redis = require('redis');
const knexLib = require( 'knex' );
const service = require( './service' );
const testconfig = require( '../testconfig' );

describe( 'keys - update', function () {
  let knex, redisClient;

  beforeAll( async () => {
    knex = knexLib({
      client: 'mysql',
      connection: testconfig.mysql
    });

    redisClient = redis.createClient(testconfig.redis.connection);
    await redisClient.connect();

    await service.initAndLoad( {
      ...testconfig,
      redis: {
        ...testconfig.redis,
        client: redisClient,
      },
      knex,
    } );
  } );

  it( 'update a key by his id', async () => {

    const result = await service( 1 ).update( { label: 'The key of dead' } );

    expect(
      _.omit( result, [ 'key', 'createdAt' ] )
    ).toEqual( {
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'The key of dead'
    } );

  } );

  it( 'update a label of key by key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' } )
      .update( { label: 'Clé' } );

    expect(
      _.omit( result, [ 'key', 'createdAt' ] )
    ).toEqual( {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Clé'
    } );

  } );

  it( 'update a key', async () => {

    try {

      const result = await service( { type: 'userPublic', identifier: 98596585 } )
        .update( { label: 'Clé' } );

    } catch ( e ) {

      expect(e.name).toBe( 'ValidationError' );

    }

  } );

} );

