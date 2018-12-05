"use strict";

const log = require( '@openagenda/logs' )( 'supervisor' );

const cluster = require( 'cluster' );

const config = require( '../config' );

let lastCrashTime;


/**
 * lib for tracking worker activities
 * and handling workforce
 */

module.exports = function( job ) {

  // mocha does not handle clusters well
  if ( process.env.NODE_ENV == 'test' ) {

    return job( true );

  }

  if ( cluster.isMaster ) {

    master();

  } else {

    worker( job );

  }

}


/**
 * administer workers and decide which handles tasks
 */

function master() {

  var total = config.multiCore ? require( 'os' ).cpus().length : 1,

  tasksWorker, crashCount = 0,

  workerCount = total - 1 || 1;

  log( 'info', 'launching on %d workers', workerCount );

  for ( var i = 0; i < workerCount; i++ ) {

    cluster.fork();

  }

  cluster.on( 'online', function( worker ) {

    if ( !tasksWorker ) {

      tasksWorker = worker.id

      worker.send( true );

    } else {

      worker.send( false );

    }

  } );

  cluster.on( 'exit', function( worker ) {

    var now = new Date;

    log( 'error', 'worker crashed!' );

    if ( worker.id == tasksWorker ) {

      tasksWorker = false;

    }

    // let the worker crash a couple of times before
    // stopping everything indefinitely
    if ( now - lastCrashTime < 1000 ) {

      if ( crashCount < 10 ) {

        log( 'error', 'crashed %s times in a row', crashCount );

        crashCount++;

      } else {

        log( 'error', 'workers chain crashing!' );

        return;

      }

    } else {

      crashCount = 0;

    }

    lastCrashTime = new Date();

    cluster.fork();

  });

}


function worker( job, cb ) {

  process.on( 'message', job );

}
