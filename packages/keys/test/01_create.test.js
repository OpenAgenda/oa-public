"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const redis = require('redis');
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'keys - create', function () {
  let knex, redisClient;

  beforeAll( async () => {
    knex = knexLib({
      client: 'mysql',
      connection: config.mysql
    });

    redisClient = redis.createClient(config.redis.connection);
    await redisClient.connect();

    await service.initAndLoad( {
      ...config,
      knex,
    } );

  } );

  afterAll(() => knex.destroy());

  afterAll(async () => {
    const { prefix } = config.redis;
    for (const key of await redisClient.keys( prefix + '*' )) {
      await redisClient.del(key);
    }
  });

  it( 'create an user key', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } )
      .create( { label: 'Ma première clé #ému' } );

    expect(
      _.omit( result, [ 'key', 'createdAt' ] )
    ).toEqual( {
      id: 3,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Ma première clé #ému'
    } );

  } );

  it( 'create an user key without label', async () => {

    const result = await service( { type: 'userPublic', identifier: 98596585 } ).create();

    expect(
      _.omit( result, [ 'key', 'createdAt' ] )
    ).toEqual({
      id: 4,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    } );

  } );

} );

