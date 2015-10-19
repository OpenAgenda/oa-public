"use strict";

process.env.NODE_ENV = 'test';

//require( 'debug' ).enable( '*' );

var config = require( '../../config' ),

model = require( 'cibulModel' )( config.db ),

redis = require( 'redis' ),

async = require( 'async' ),

Browser = require( 'zombie' ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

sets = require( 'cibulModel/test/fixtures/sets' )( model ),

coms = require( '../../lib/coms' ),

server;

module.exports = {
  boot: boot,
  shutdown: shutdown,
  loadBrowser: loadBrowser,
  model: model,
  sets: sets,
  fixtures: fixtures,
  redisGet: redisGet,
  clearAll: clearAll,
  clearStore: clearStore,
  coms: coms,
  should: require( 'should' ),
  utils: require( '../../lib/utils' ),
  do: {
    signin: signin
  }
};

function boot( startApp, cb ) {

  if ( !cb ) {

    cb = startApp;

    startApp = true;

  }

  clearAll( function() {

    if ( startApp && !server ) {

      require( '../../app.js' )( function( err, s ) {

        server = s;

        cb();

      } );

    } else {

      cb();

    }

  });

}

function shutdown( cb ) {

  cb();

}

function clearAll( cb ) {

  async.parallel([
    fixtures.clearAll,
    clearStore
  ], cb );

}



function loadBrowser( cb ) {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  var browser = new Browser();

  browser.site = 'https://d.openagenda.com';

  cb( null, browser );

}

function redisGet( key, cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host );

  cli.get( key, cb );

}

function clearStore( cb ) {

  var cli = redis.createClient( config.redis.port, config.redis.host );

  cli.flushdb( cb );

}

function signin( browser, user, nextUrl ) {

  return browser.visit( '/signin' )

  .then( function() {

    browser.fill( 'email', user.email );

    browser.fill( 'password', user.password );

    return browser.pressButton( 'signin' );

  } )

  // js errors on php gen page causes zombie error
  .then( done, done );

  function done( err ) {


    if ( !nextUrl ) return;

    return browser.visit( nextUrl );

  }

}