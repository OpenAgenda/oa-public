var cluster = require( 'cluster' ),

logger = require( './logger' ),

config = require( '../config' ),

log = logger( 'supervisor' ),

lastCrashTime;


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

  tasksWorker, crashCount = 0;

  log( 'info', 'launching on %d workers', total );

  for ( var i = 0; i < total; i++ ) {

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

  logger().setPaths( 
    config.logPath.replace( 'log', cluster.worker.id + '.log' ),
    config.logPathError.replace( 'log', cluster.worker.id + '.log' )
  );

  logger().globalLoad( { workerId: cluster.worker.id } );

  process.on( 'message', job );

}