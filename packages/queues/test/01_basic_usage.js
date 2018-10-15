"use strict";

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

  test( 'enqueue and pop', async () => {

    await q( { some: 'data' } );

    const popped = await q.pop();

    expect( popped ).toEqual( { some: 'data' } );

  } );

  test( 'total provides.. total', async () => {

    await q( { data: 'some' } );

    await q( { data: 'more' } );

    expect( await q.total() ).toEqual( 2 );

  } );

  test( 'wait for pop and enqueue', done => {

    q.waitAndPop().then( data => {

      expect( data ).toEqual( { et: 'bim' } );

      done();

    } );

    q( { et: 'bim' } );

  } );

} );
