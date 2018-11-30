"use strict";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

[ 'web', 'admin', 'task' ].forEach( argItem => {

  if ( process.argv.includes( argItem ) ) {
    process.env[ argItem.toUpperCase() ] = 'true';
  }

} );

const supervisor = require( './lib/supervisor' );

supervisor( loadTasks => {

  require( './services/init' )( err => {

    const logger = require( '@openagenda/logger' );

    const log = logger( 'server' );

    if ( err ) {

      console.log( err );

      return log( 'error', 'could not init app: %s', err );

    }

    if ( __DEVELOPMENT__ ) {
      require( 'source-map-support' ).install( { hookRequire: true } );
    }

    log( 'info', 'running server' );

    const { WEB, TASK } = process.env;
    const app = require( './app' );
    const config = require( './config' );

    app.server.listen( config.port, () => {

      log( 'info', '-- Server listening on port %s --', config.port );

    } );

    if ( WEB ) {

      require( './api' );

    }

    // only one process runs background tasks. supervisor handles that.
    // only 'task' types run tasks
    if ( loadTasks && TASK ) {

      require( './task' )();

    }

  } );

} );
