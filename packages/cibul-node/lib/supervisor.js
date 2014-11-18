var cluster = require( 'cluster' ),

logger = require( './logger' ),

config = require( '../config' ),

log = logger( 'supervisor' );


/**
 * lib for tracking worker activities
 * and handling workforce
 */

module.exports = function( job ) {

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

  tasksWorker;

  log( 'info', 'will run on %d workers', total );

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

}


function worker( job ) {

  logger().globalLoad( { workerId: cluster.worker.id } );

  process.on('message', job );

}