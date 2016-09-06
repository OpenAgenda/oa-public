"use strict"

var q,

utils = require( 'utils' ),

libs = {
  notify: require( './notify' ),
  evaluate: require( './evaluate' ),
  sources: require( './sources' )
},

logger = require( 'logger' ), log,

onProcessed; // for testing

module.exports = utils.extend( launch, {
  set,
  shutdown,
  test: {
    setOnProcessed,
    unsetOnProcessed
  }
});

function launch() {

  log = logger( 'services/aggregator/task' );

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

    log( 'error', 'method not set' );

    return cb();

  }

  if ( !args || !utils.isArray( args ) ) {

    log( 'error', 'args not set' );

    return cb();

  }

  method = method.split( '.' );

  if ( method.length !== 2 ) {

    log( 'error', 'wrong method format' );

    return cb();

  }

  if ( !libs[ method[ 0 ] ] ) {

    log( 'error', 'unknown method lib: ' + method[ 0 ] );

    return cb();

  }

  if ( !libs[ method[ 0 ] ][ method[ 1 ] ] ) {

    log( 'error', 'unknown lib method: ' + data.method );

    return cb();

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