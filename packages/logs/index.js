"use strict";

const path = require( 'path' );
const _ = require( 'lodash' );
const winston = require( 'winston' );
const debug = require( 'debug' );
const DebugTransport = require( './DebugTransport' );
const { getCallerFile, getModule } = require( './utils/caller' );

require( 'le_node' );

let config;
const levels = Object.keys( winston.config.npm.levels );

const loggers = [];
const loggerConfigs = {};
const basicLogger = getLogger();

module.exports = Object.assign( createLogger, {
  init,
  setModuleConfig,
  log: basicLogger.log.bind( basicLogger )
}, _.pick( basicLogger, levels ) );

function createLogger( namespace, ...args ) {
  if ( levels.includes( namespace ) && args.length ) {
    return basicLogger[ namespace ]( ...args );
  }

  return getLogger( { namespace } );
}

function getLogger( options ) {

  const callerFile = getCallerFile( 2 );
  const callerModule = getModule( path.resolve( callerFile ) );

  const logger = new winston.Logger( {
    transports: getTransports( _.merge( {}, options, loggerConfigs[ callerModule ] ) )
  } );

  logger.options = options;
  logger.callerFile = callerFile;
  logger.callerModule = callerModule;

  logger.loadMetadata = metadata => {

    logger.rewriters.push( ( level, msg, meta ) => Object.assign( {}, metadata, meta ) );

  }

  loggers.push( logger );

  const levellessLog = ( level, ...args ) => {

    if ( levels.includes( level ) && args.length ) {
      return logger[ level ]( ...args );
    }

    return logger[ 'debug' ]( level, ...args );

  };

  const customMethods = _.mapValues(
    _.pick( logger, 'log', 'loadMetadata', 'configure' ),
    v => v.bind( logger )
  );

  return Object.assign( levellessLog, logger, customMethods );

}

function getTransports( options ) {

  const params = _.merge( {
    namespace: '',
    debug: {
      prefix: 'oa:'
    },
    errorsTracking: {}
  }, config, options );

  const transports = [];

  const env = getEnv();

  if ( env === 'development' ) {

    transports.push( new DebugTransport( {
      level: 'debug',
      namespace: params.namespace,
      prefix: params.debug.prefix
    } ) );

  }

  if ( env === 'production' ) {

    if ( params && params.errorsTracking && params.errorsTracking.logentriesKey ) {
      transports.push( new winston.transports.Logentries( {
        level: 'info',
        token: params.errorsTracking.logentriesKey,
        json: true
      } ) );
    }

  }

  return transports;

}

function init( c ) {

  config = _.merge( {
    namespace: '',
    debug: {
      prefix: 'oa:'
    }
  }, c );

  if ( config.debug && config.debug.enable ) {
    debug.enable( c.debug.enable );
  }

  basicLogger.configure( {
    transports: getTransports( config )
  } );

}

function setModuleConfig( conf ) {

  const callerModule = getModule( path.resolve( getCallerFile( 2 ) ) );

  loggerConfigs[ callerModule ] = conf;

  loggers.filter( logger => logger.callerModule === callerModule ).map( logger => {

    logger.configure( {
      transports: getTransports( _.merge( logger.options, conf ) )
    } );

  } );

}

function getEnv() {
  return process.env.NODE_ENV || 'development';
}
