"use strict";

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const _ = require( 'lodash' );
const async = require( 'async' );
const fs = require( 'fs' );
const VError = require( 'verror' );
const w = require( 'when' );

const logs = require( '@openagenda/logs' );
const logger = require( '@openagenda/logger' );
const validators = require( '@openagenda/validators' );
const schema = require( '@openagenda/validators/schema' );

schema.register( {
  pass: require( '@openagenda/validators/pass' )
} );

const validateOptions = schema( {
  enabled: {
    list: true,
    type: 'pass'
  }
} );

let log;


module.exports = function ( config, options, cb ) {

  const t = new Date();

  // define config to use
  if ( arguments.length == 1 && typeof config === 'function' ) {

    cb = config;
    config = require( '../config' );
    options = {};

  } else if ( arguments.length === 0 ) {

    config = require( '../config' );
    cb = () => {};

  } else if ( arguments.length === 2 ) {

    cb = options;
    config = require( '../config' );
    options = {};

  }

  const cleanOptions = validateOptions( options );

  // init logger

  if ( config.logger ) logger.init( config.logger );

  logs.init( config.logger || config.getLogConfig( 'oa', 'oa', false ) );

  log = logs( 'services/init' );


  // init services

  fs.readdir( __dirname, ( err, services ) => {

    if ( err ) return cb( err );

    async.eachSeries( services, _init.bind( null, config, cleanOptions ), err => {

      if ( err ) return cb( new VError( err, 'service initialization did not go well' ) );

      log( 'info', 'ok %s', ( ( new Date ).getTime() - t.getTime() ) + 'ms' );

      cb();

    } );

  } );

}

// init does not need to be initialized by init.
module.exports.initless = true;


function _init( config, options, fileOrFolderName, cb ) {

  const t = new Date();

  const name = fileOrFolderName.split( '.' )[ 0 ];

  const service = require( __dirname + '/' + name );

  if ( options.enabled.length && !options.enabled.includes( name ) ) {

    return cb();

  }

  if ( service.initless ) {

    // not worth logging, no need to worry.
    return cb();

  }

  if ( !service.init ) {

    log( 'error', '%s: >>>>>>>>>>>>>>>>>>>>>> init missing! <<<<<<<<<<<<<<<<<<<<<<<', name );

    return cb();

  }

  log( 'info', '%s: initializing', name );

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
