"use strict";

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

const path = require( 'path' );
const fs = require( 'fs' );
const async = require( 'async' );
const VError = require( 'verror' );
const w = require( 'when' );
const logs = require( '@openagenda/logs' );
const logger = require( '@openagenda/logger' );
const schema = require( '@openagenda/validators/schema' );

const SERVICES_PATH = __dirname;

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

  fs.readdir( SERVICES_PATH, ( err, services ) => {

    if ( err ) return cb( err );

    async.eachSeries( services, _init.bind( null, config, cleanOptions ), err => {

      if ( err ) return cb( new VError( err, 'service initialization did not go well' ) );

      log( 'info', 'ok %s', ( new Date().getTime() - t.getTime() ) + 'ms' );

      cb();

    } );

  } );

}

// init does not need to be initialized by init.
module.exports.initless = true;


function _init( config, options, fileOrFolderName, cb ) {

  const t = new Date();

  const name = fileOrFolderName.split( '.' )[ 0 ];
  const service = require( path.join( SERVICES_PATH, name ) );

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

  const cbWithLog = err => {

    log( 'info', `${name}: ${err ? 'NOK' : 'ok'} ${new Date().getTime() - t.getTime()}ms` );

    return cb( err );

  };

  w( service.init( config ) ).done( () => cbWithLog(), cbWithLog );

}
