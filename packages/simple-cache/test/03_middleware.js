"use strict";

const should = require( 'should' ),

  sCache = require( '../' ),

  sCacheMiddleware = require( '../middleware' ),

  config = require( '../testconfig' ),

  redis = require( 'redis' );

describe( 'simple-cache - functional (middleware)', function() {

  let cli = redis.createClient( config.redis.port, config.redis.host );

  before( () => {

    cli = redis.createClient( config.redis.port, config.redis.host );    

  } );

  before( () => {

    sCache.init( config );

  } );

  beforeEach( done => {

    cli.keys( config.prefix + '*', ( err, keys ) => {

      cli.del( keys.join( ' ' ), done );

    } );

  } );


  it( 'middleware executes success middleware when cached value exists', done => {

    // this is the created middleware for a specific route to be cached
    let mw = sCacheMiddleware( 'agenda', 'params.uid', ( cached, req, res ) => {

      cached.should.equal( '<html>This is cached</html>' );

      done()

    } ),

      // this is a request
      req = {
        url: '/this/is/my/url',
        params: { uid: 123 }
      },

      res = {},

      next = ( req, res, next ) => {};

    sCache( 'agenda', 123 ).set( '/this/is/my/url', '<html>This is cached</html>', 10, err => {

      mw( req, res, next );

    } );

  } );

} );