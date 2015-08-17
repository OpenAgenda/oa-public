"use strict"

var q,

utils = require( 'utils' ),

libs = {
  notify: require( './notify' ),
  evaluate: require( './evaluate' ),
  sources: require( './sources' )
},

log = require( 'logger' )( 'aggregator task' ),

onProcessed; // for testing

module.exports = launch;

utils.extend( module.exports, {
  set: set,
  shutdown: shutdown,
  test: {
    setOnProcessed: setOnProcessed,
    unsetOnProcessed: unsetOnProcessed
  }
});

function launch() {

  if ( !q ) return _err( 'aggregator has not been initialized' );

  q.setConsumer( _process );

  q.launch();

  log( 'launched aggregator task' );

}

function shutdown() {

  if ( !q ) return _err( 'aggregator has not been initialized' );

  q.shutdown();

}

function set( config ) {

  q = config.q;

}

function _process( data, cb ) {

  var method = data.method,

  args = data.args;

  if ( !method ) {

    return log( 'error', 'method not set' );

  }

  if ( !args || !utils.isArray( args ) ) {

    return log( 'error', 'args not set' );

  }

  method = method.split( '.' );

  if ( method.length !== 2 ) {

    return log( 'error', 'wrong method format' );

  }

  if ( !libs[ method[ 0 ] ] ) {

    return log( 'error', 'unknown method lib: ' + method[ 0 ] );

  }

  if ( !libs[ method[ 0 ] ][ method[ 1 ] ] ) {

    return log( 'error', 'unknown lib method: ' + data.method );

  }

  log( 'running %s with args %s', method.join( '.' ), JSON.stringify( args ) );

  // here be the callback!
  args.push( function( err ) {

    if ( err ) log( 'error', err );

    if ( onProcessed ) onProcessed( err, {
      lib: method[ 0 ], 
      method: method[ 1 ]
    });

    cb();

  });

  libs[ method[ 0 ] ][ method[ 1 ] ].apply( null, data.args );

}

function setOnProcessed( cb ) {

  onProcessed = cb;

}

function unsetOnProcessed( cb ) {

  onProcessed = false;

  if ( cb ) cb();

}