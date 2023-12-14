"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const redis = require('redis');
const service = require( './service' );
const mw = require( '../middleware' );
const testconfig = require( '../testconfig' );

describe( 'keys - middleware', function () {
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

  afterAll(() => knex.destroy());

  afterEach(async () => {
    const { prefix } = testconfig.redis;
    
    for (const key of await redisClient.keys( prefix + '*' )) {
      await redisClient.del(key);
    }
  });

  it( 'create successfully', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596586 },
      body: { label: 'Ma première clé #ému' }
    }

    mw.create()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(_.omit( req.result, [ 'key', 'createdAt' ] )).toEqual( {
        id: 3,
        type: 'userPublic',
        identifier: 98596586,
        label: 'Ma première clé #ému'
      } );

      done();

    } );

  } );

  it( 'create which fail the validation', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      body: { label: {} }
    }

    mw.create()( req, {}, err => {

      expect(err).toEqual( {
        code: 400,
        json: {
          errors: [
            {
              field: 'label',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            }
          ]
        }
      } );

      done();

    } );

  } );

  it( 'get', done => {

    const req = {
      identifiers: 1
    }

    mw.get()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(_.omit( req.result, [ 'key', 'createdAt' ] )).toEqual( {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !'
      } );

      done();

    } );

  } );

  it( 'get by key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' }
    }

    mw.get()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(_.omit( req.result, [ 'key', 'createdAt' ] )).toEqual( {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null
      } );

      done();

    } );

  } );

  it( 'get which fail the validation', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: {} }
    }

    mw.get()( req, {}, err => {

      expect(err).toEqual( {
        code: 400,
        json: {
          errors: [
            {
              field: 'key',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            }
          ]
        }
      } );

      done();

    } );

  } );

  it( 'simple list', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 }
    };

    mw.list()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) )).toEqual( [
        {
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Vielle clé !'
        },
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'list an offset and a limit', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      query: { offset: 1, limit: 1 }
    };

    mw.list()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) )).toEqual( [
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'list gives total', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      options: { total: true }
    };

    mw.list()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(req.result.total).toBe(2);
      expect(req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) )).toEqual( [
        {
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Vielle clé !'
        },
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'update by id', done => {

    const req = {
      identifiers: 1,
      body: { label: 'The key of dead' }
    };

    mw.update()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(_.omit( req.result, [ 'key', 'createdAt' ] )).toEqual( {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'The key of dead'
      } );

      done();

    } );

  } );

  it( 'update a label of key by key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' },
      body: { label: 'Clé' }
    };

    mw.update()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(_.omit( req.result, [ 'key', 'createdAt' ] )).toEqual( {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Clé'
      } );

      done();

    } );

  } );

  it( 'remove a key by his id', done => {

    const req = {
      identifiers: 1
    }

    mw.remove()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(req.result).toBe(1);

      done();

    } );

  } );

  it( 'remove a key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' }
    }

    mw.remove()( req, {}, err => {

      expect(err).toBeUndefined();

      expect(req.result).toBe(1);

      done();

    } );

  } );

} );
