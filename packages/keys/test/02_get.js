const _ = require( 'lodash' );
const should = require( 'should' );
const sinon = require( 'sinon' );
const knexLib = require( 'knex' );
const service = require( './service' );
const testconfig = require( '../testconfig' );
const config = require( '../service/config' );

describe( 'keys - get', function () {

  this.timeout( 30000 );

  before( async () => {

    await service.initAndLoad( {
      ...testconfig,
      knex: knexLib({
        client: 'mysql',
        connection: testconfig.mysql
      })
    } );

  } );

  afterEach( async () => {

    const { client, prefix } = config.redis;

    const keys = await client.keys( prefix + '*' );

    if ( keys && keys.length ) await client.del(keys.join(','));

  } );

  it( 'get a key by his id', async () => {

    const result = await service( 1 ).get();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 1,
      type: 'userPublic',
      identifier: 98596585,
      label: 'Vielle clé !'
    } );

  } );

  it( 'get a key', async () => {

    const result = await service( {
      type: 'userPublic',
      identifier: 98596585,
      key: '2733c8183cca49dcbfbaefd6c957f5b6'
    } )
      .get();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    } );

  } );

  it( 'get by key', async () => {

    const result = await service( { key: '2733c8183cca49dcbfbaefd6c957f5b6' } )
      .get();

    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    } );

  } );

  it( 'get by key - without cache', async () => {

    const exceptedResult = {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    };

    const spy = sinon.spy( config, 'knex' );
    spy.callCount.should.equal( 0 );

    let result = await service( { key: '2733c8183cca49dcbfbaefd6c957f5b6' } ).get();

    spy.callCount.should.equal( 1 );
    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( exceptedResult );

    result = await service( { key: '2733c8183cca49dcbfbaefd6c957f5b6' } ).get();

    spy.callCount.should.equal( 2 );
    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( exceptedResult );

    spy.restore();

  } );

  it( 'get by key - with cache', async () => {

    const exceptedResult = {
      id: 2,
      type: 'userPublic',
      identifier: 98596585,
      label: null
    };

    const spy = sinon.spy( config, 'knex' );
    spy.callCount.should.equal( 0 );

    let result = await service( { key: '2733c8183cca49dcbfbaefd6c957f5b6' } ).get( { cache: true } );

    spy.callCount.should.equal( 1 );
    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( exceptedResult );

    result = await service( { key: '2733c8183cca49dcbfbaefd6c957f5b6' } ).get( { cache: true } );

    spy.callCount.should.equal( 1 );
    _.omit( result, [ 'key', 'createdAt' ] ).should.eql( exceptedResult );

  } );

} );
