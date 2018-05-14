"use strict";

const config = require( '../config.dev' ).queue;
const queue = require( '../server/queue' );

describe( 'unit - queue', () => {

  describe( 'init', () => {

    test( 'redis availability is tested at init', async () => {

      try {

        await queue.init( {
          namespace: 'testoadocx',
          port: 6389,
          host: 'localhost'
        } );

      } catch ( e ) {

        expect( e.jse_shortmsg ).toBe( 'oa-docx init - Could not connect to redis' );

      }

    } );

  } );

  describe( 'queue operations', () => {

    beforeAll( async () => {

      await queue.init( {
        namespace: 'testoadocx',
        port: 6379,
        host: 'localhost'
      } );

    } );

    beforeEach( async () => {

      await queue.clear();

    } );

    test( 'queue and pop queue', async () => {

      expect( await queue.total() ).toEqual( 0 );

      await queue( { uid: 123, data: 'oui?' } );

      expect( await queue.total() ).toEqual( 1 );

      expect( await queue.pop() ).toEqual( { uid: 123, data: 'oui?' } );

    } );


    test( 'wait for queue', cb => {

      // nothing has been queued at time of call
      queue.waitAndPop().then( data => {

        expect( data ).toEqual( { et: 'bim' } );

        cb();

      } );

      queue( { et: 'bim' } );

    } );

  } );

} );