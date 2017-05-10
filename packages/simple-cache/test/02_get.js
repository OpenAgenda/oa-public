"use strict";

const should = require( 'should' ),

  sCache = require( '../' ),

  config = require( '../testconfig' ),

  redis = require( 'redis' );

describe( 'simple-cache - functional (service): get', function() {

  this.timeout( 4000 );

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


  it( 'get fetches value stored specific namespace, id, key redis key', done => {

    cli.set( config.prefix + 'agenda:123:http://lepassageduponceau.fr', '<html>Les lundi</html>', err => {

      sCache( 'agenda', 123 ).get( 'http://lepassageduponceau.fr', ( err, value ) => {

        value.should.equal( '<html>Les lundi</html>' );

        done();

      } );

    } );

  } );


  it( 'get returns null if no value was found', done => {

    sCache( 'agenda', 456 ).get( 'bloublou', ( err, value ) => {

      should( err ).equal( null );

      should( value ).equal( null );

      done();

    } );

  } );

} );