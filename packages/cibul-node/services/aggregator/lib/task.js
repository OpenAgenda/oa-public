"use strict"

const utils = require( '@openagenda/utils' ),

  libs = {
    notify: require( './notify' ),
    evaluate: require( './evaluate' ),
    sources: require( './sources' )
  },

  log = require( '@openagenda/logs' )( 'services/aggregator/task' );

let q, pQ;

module.exports = utils.extend( launch, {
  set,
  shutdown
});

function launch() {

  if ( !q || !pQ ) return _err( 'aggregator has not been initialized' );

  q.setConsumer( _process );

  q.launch( { interval: 100 } );

  pQ.setConsumer( _process );

  pQ.launch();

  log( 'launched aggregator task' );

}

function shutdown() {

  if ( !q || !pQ ) return _err( 'aggregator has not been initialized' );

  q.shutdown();

}

function set( config ) {

  q = config.q;

  pQ = config.pQ

}

function _process( data, cb ) {

  let method = data.method;

  const args = data.args;

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

    cb( err );

  } );

  libs[ method[ 0 ] ][ method[ 1 ] ].apply( null, data.args );

}
