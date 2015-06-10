"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../../../config' ),

cache = require( '../' ),

utils = require( '../../../lib/utils' ),

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


describe( 'cache - function', function() {

  var testFunc = function( param, cb ) {

    cb( null, 'here: ' + param );

  }

  beforeEach( function( done ) {

    _funcDel( 'namespace', 'testFunc', done );

  });

  it( 'first func call triggers caching', function( done ) {

    var wrapped = cache.func( 'namespace', 'testFunc', testFunc );

    wrapped( 'yeaay', function( err, result ) {

      _hFuncGet( 'namespace', 'testFunc', 'yeaay', function( err, result ) {

        result.should.equal( JSON.stringify( 'here: yeaay' ) );

        done();

      } );

    } );

  } );

  it( 'cache clearer function removes the cache value', function( done ) {

    var wrapped = cache.func( 'namespace', 'testFunc', testFunc );

    wrapped( 'yeaay', function( err, result ) {

      wrapped.cache.clear( function( err ) {

        _hFuncGet( 'namespace', 'testFunc', 'yeaay', function( err, result ) {

          should( result ).equal( null );

          done();

        } );

      });

    } );

  });

});

describe( 'cache - instance', function() {

  before( function( done ) {

    cache( 'agenda', testInstance, [ 'test', 'test2' ], [ 'test4' ] );

    _instanceDel( done );

  });


  it( '1st method call triggers caching', function( done ) {

    _hInstanceGet( 'test', function( err, redisData ) {

      should.equal( redisData, null );

      testInstance.test( function( err, data ) {

        _hInstanceGet( 'test', function( err, redisData ) {

          JSON.parse( redisData ).should.eql( data );

          done();

        });

      });

    });

  } );


  it( 'instance save clears the cache', function( done ) {

    testInstance.test( function( err, data ) {

      _hInstanceGet( 'test', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        testInstance.save( { random: 'newData' }, function() {

          _hInstanceGet( 'test', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          });

        });

      });

    });

  });


  it( 'diff in timestamp clears the cache', function( done ) {

    testInstance.test2( function( err, data ) {

      _hInstanceGet( 'test2', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        testInstance.updatedAt = new Date();

        testInstance.test( function( err, irreleventHere ) {

          _hInstanceGet( 'test2', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          });

        });

      });

    })

  } );


  it( 'calling cache clearing method clears the cache', function( done ) {

    testInstance.test2( function( err, data ) {

      _hInstanceGet( 'test2', function( err, redisData ) {

        JSON.parse( redisData ).should.eql( data );

        // calling a cache clearing method!
        testInstance.test4( function( err, yayawhatever ) {

          // is this still cached?
          _hInstanceGet( 'test2', function( err, redisData ) {

            should.equal( redisData, null );

            done();

          } );

        });

      });

    });

  });
  

  it( 'method not inited to be cached is not cached', function( done ) {

    testInstance.test3( function( err, nobodyCares ) {

      _hInstanceGet( 'test3', function( err, redisData ) {

        should.equal( redisData, null );

        done();

      });

    });

  });

} );



function _hFuncGet( namespace, name, key, cb ) {

  if ( !utils.isArray( key ) ) key = [ key ];

  cli.hget( 'cache:' + namespace + ':' + name, JSON.stringify( key ), cb );

}

function _hInstanceGet( name, cb ) {

  cli.hget( 'cache:instance:agenda:' + testInstance.id, name, cb );

}

function _funcDel( namespace, name, cb ) {

  cli.del( 'cache:' + namespace + ':' + name, cb );

}

function _instanceDel( cb ) {

  cli.del( 'cache:instance:agenda:' + testInstance.id, cb );

}

function _makeTestFunc( text ) {

  return function( cb ) {

    cb( null, {
      text: text
    });

  };

}