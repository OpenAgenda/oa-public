"use strict";

const should = require( 'should' );

const queues = require( '../' );

describe( 'basic usage', () => {

  let q;

  beforeEach( async () => {

    queues.init( {
      redis: { host: 'localhost', port: 6379 },
      prefix: 'oatestqueues'
    } );

    q = queues( '01_basic_usage' );

    await q.clear();

  } );

  it( 'enqueue and pop', async () => {

    await q( { some: 'data' } );

    const popped = await q.pop();

    popped.should.eql( { some: 'data' } );

  } );

  it( 'total provides.. total', async () => {

    await q( { data: 'some' } );

    await q( { data: 'more' } );

    ( await q.total() ).should.eql( 2 );

  } );

  it( 'wait for pop and enqueue', done => {

    q.waitAndPop().then( data => {

      data.should.eql( { et: 'bim' } );

      done();

    } );

    q( { et: 'bim' } );

  } );

} );
