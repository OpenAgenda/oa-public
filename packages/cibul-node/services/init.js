"use strict";

const VError = require( 'verror' );
const w = require( 'when' );
const fs = require( 'fs' );
const async = require( 'async' );
const logs = require( 'logs' );
const logger = require( 'logger' );

let log;


module.exports = function ( config, cb ) {

  let t = new Date;

  // define config to use
  if ( arguments.length == 1 && typeof config === 'function' ) {

    cb = config;
    config = require( '../config' );

  } else if ( arguments.length === 0 ) {

    config = require( '../config' );
    cb = () => {};

  }

  // init logger

  logger.init( config.logger );
  logs.init( config.logger );

  log = logger( 'init' );


  // init services

  fs.readdir( __dirname, ( err, services ) => {

    if ( err ) return cb( err );

    async.eachSeries( services, _init.bind( null, config ), err => {

      if ( err ) return cb( new VError( err, 'service initialization did not go well' ) );

      log( 'info', 'ok %s', ( ( new Date ).getTime() - t.getTime() ) + 'ms' );

      cb();

    } );

  } );

}

// init does not need to be initialized by init.
module.exports.initless = true;


function _init( config, fileOrFolderName, cb ) {

  let t = new Date();

  const name = fileOrFolderName.split( '.' )[ 0 ];

  let service = require( __dirname + '/' + name );

  if ( service.initless ) {

    // not worth logging, no need to worry.
    return cb();

  }

  log( 'info', 'initializing %s', name );

  if ( !service.init ) {

    log( 'error', '%s: >>>>>>>>>>>>>>>>>>>>>> init missing! <<<<<<<<<<<<<<<<<<<<<<<', name );

    return cb();

  }

  if ( service.init.length === 1 ) {

    const cb2 = err => {
      log( 'info', '%s: ok %s', name, ( ( new Date ).getTime() - t.getTime() ) + 'ms' );
      cb( err );
    }

    w( service.init( config ) ).done( () => cb2(), cb2 );

  } else {

    service.init( config, err => {

      log( 'info', err ? '%s: NOK' : '%s: ok %s', name, ( ( new Date ).getTime() - t.getTime() ) + 'ms' );

      cb( err );

    } );

  }

}