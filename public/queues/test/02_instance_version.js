"use strict";

const should = require( 'should' );

const queues = require( '../' );
const redis = require( 'redis' );
const promisifyRedis = require( '../utils/promisifyRedis' );

describe( 'instance version', () => {

  let q, pRedis;

  beforeEach( async () => {

    const redisCli = redis.createClient();

    const v2Queues = queues.v2( { redis: redisCli, prefix: 'v2q:' } );

    q = v2Queues( '02_instance_version' );

    pRedis = promisifyRedis( redisCli );

  } );

  afterEach( async () => {

    await q.stop();
    await q.clear();

    await pRedis.quit();

  } );

  it( 'instance queues up what it is given', async () => {

    await q( 'doThing', 1, 2, 3 );

    (
      await pRedis.lpop( 'v2q:02_instance_version' )
    ).should.equal(
      '{"method":"doThing","args":[1,2,3]}'
    );

  } );

  it( 'registered function matching queued name are called when queue is run', done => {

    function doOtherThing( one, two, three ) {

      one.should.equal( 1 );
      two.should.equal( 2 );
      three.should.equal( 3 );

      done();

    }

    q.register( { doOtherThing } );

    q.run();

    q( 'doOtherThing', 1, 2, 3 );

  } );

  it( 'if no matching function corresponds to queued emthod, it is discarded', done => {

    q.run();

    q.on( 'error', ( method, args, error ) => {

      error.message.should.equal( 'Unregistered method: doUnkownThing' );

      done();

    } );

    q( 'doUnkownThing', 1 );

  } );

  it( 'a method throwing an exception does not interrupt queue processing', done => {

    function throwsError() {

      throw new Error( 'Oh nos!' );

    }

    function doesThings( message ) {

      message.should.equal( 'ok' );

      done();

    }

    q.register( { throwsError, doesThings } );

    q.run();

    q( 'throwsErrors' );

    q( 'doesThings', 'ok' );

  } );

} );
