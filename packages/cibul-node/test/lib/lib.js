"use strict";

process.env.NODE_ENV = 'test';

//require( 'debug' ).enable( '*' );

var config = require( '../../config' ),

model = require( 'cibulModel' )( config.db ),

redis = require( 'redis' ),

async = require( 'async' ),

Browser,

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

sets = require( 'cibulModel/test/fixtures/sets' )( model ),

coms = require( '../../lib/coms' );

module.exports = {
  boot: boot,
  loadBrowser: loadBrowser,
  model: model,
  sets: sets,
  fixtures: fixtures,
  redisGet: redisGet,
  clearAll: clearAll,
  clearStore: clearStore,
  coms: coms,
  should: require( 'should' )
};

function boot( startApp, cb ) {

  if ( !cb ) {

    cb = startApp;

    startApp = true;

  }

  clearAll( function() {

    if ( startApp ) {

      require( '../../app.js' )( function() {

        _initZombie( cb );

      } );

    } else {

      _initZombie( cb );

    }

  });

}

function clearAll( cb ) {

  async.parallel([
    fixtures.clearAll,
    clearStore
  ], cb );

}

function _initZombie( cb ) {

  Browser = require( 'zombie' );

  Browser.localhost( 'https://d.cibul.net', 443 );

  cb();

}

function loadBrowser( cb ) {

  cb( null, Browser.create() );

}

function redisGet( key, cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host );

  cli.get( key, cb );

}

function clearStore( cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host );

  cli.flushdb( cb );

}