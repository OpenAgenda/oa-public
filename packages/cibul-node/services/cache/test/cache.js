"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../../../config' ),

cache = require( '../' ),

cli = require( 'redis' ).createClient( 
  config.redis.port, 
  config.redis.host
),

testInstance = {
  id: 666,
  test: _makeTestFunc( 'gooey' ),
  test2: _makeTestFunc( 'creepy' ),
  test3: _makeTestFunc( 'crawlers' ),
  test4: _makeTestFunc( 'oooooh' ),
  save: function( values, cb ) {

    // db save normally happens here
    
    testInstance.updatedAt = new Date();

    process.nextTick( cb );

  },
  updatedAt: new Date()
};

cache.init( config.redis );

describe( 'cache', function() {

  before( function( done ) {

    cache( 'agenda', testInstance, [ 'test', 'test2' ], [ 'test4' ] );

    _del( done );

  });


  it( '1st method call triggers caching', function( done ) {

    _hget( 'test', function( err, redisData ) {

      should.equal( redisData, null );

      testInstance.test( function( err, data ) {

        _hget( 'test', function( err, redisData ) {

          JSON.parse( redisData ).should.eql( data );

          done();

        });

      });

    });

  } );


  it( 'instance save clears the cache', function( done ) {

    testInstance.test( function( err, data ) {

      _hget( 'test', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        testInstance.save( { random: 'newData' }, function() {

          _hget( 'test', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          });

        });

      });

    });

  });


  it( 'diff in timestamp clears the cache', function( done ) {

    testInstance.test2( function( err, data ) {

      _hget( 'test2', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        testInstance.updatedAt = new Date();

        testInstance.test( function( err, irreleventHere ) {

          _hget( 'test2', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          });

        });

      });

    })

  } );


  it( 'calling cache clearing method clears the cache', function( done ) {

    testInstance.test2( function( err, data ) {

      _hget( 'test2', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        // calling a cache clearing method!
        testInstance.test4( function( err, yayawhatever ) {

          // is this still cached?
          _hget( 'test2', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          } );

        });

      });

    });

  });
  

  it( 'method not inited to be cached is not cached', function( done ) {

    testInstance.test3( function( err, nobodyCares ) {

      _hget( 'test3', function( err, redisData ) {

        should.equal( redisData, null );

        done();

      });

    });

  });

} );


function _hget( name, cb ) {

  cli.hget( 'cache:agenda:' + testInstance.id, name, cb );

}

function _del( cb ) {

  cli.del( 'cache:agenda:' + testInstance.id, cb );

}

function _makeTestFunc( text ) {

  return function( cb ) {

    cb( null, {
      text: text
    });

  };

}