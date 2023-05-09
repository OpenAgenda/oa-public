"use strict";

const should = require( 'should' );

const queues = require( '..' );
const redis = require( 'redis' );

describe( 'instance version', () => {

  let q;
  let redisCli;

  beforeEach( async () => {

    redisCli = redis.createClient({
      host: 'localhost',
      port: 6379,
    });

    await redisCli.connect();

    const v2Queues = queues( { redis: redisCli, prefix: 'v2q:' } );

    q = v2Queues( '02_instance_version' );

  } );

  afterEach( async () => {

    await q.stop();
    await q.clear();

    await redisCli.quit();

  } );

  it( 'instance queues up what it is given', async () => {

    await q( 'doThing', 1, 2, 3 );

    (
      await q.len()
    ).should.equal(1);

    (
      await redisCli.lPop( 'v2q:02_instance_version' )
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
