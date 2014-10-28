/**
 * task that syncs elasticsearch index 
 * as events and reviews are modified/added/deleted
 */


var log = require( '../lib/logger' )( 'search task' ),

async = require( 'async' ),

coms = require( '../lib/coms' ),

cmn = require( '../lib/commons-task' ),

config = require( '../config' ),

model = cmn.getCibulModel(),

ES = require( 'ES' )( config.es ),

running = false,

_onStart,

_onComplete,

jobHandlers = {
  'index.rebuild' : _rebuild,
  'event.publish' : _publish( 'events' ),
  'event.delete' : _delete( 'events' ),
  'event.update' : _update( 'events' ),
  'review.publish' : _publish( 'reviews' ),
  'review.delete' : _delete( 'reviews' ),
  'review.update' : _update( 'reviews' )
};



/**
 * exposed function list
 */

exports.load = cmn.makeLoad( run );
exports.run = run;

// for testing
exports.setOnStart = setOnStart;
exports.setOnComplete = setOnComplete;
exports.setComs = setComs;


function run() {

  if ( running ) {

    log( 'alreaddy running' );

    return;

  }

  log( 'running' );

  running = true;

  shutdownRequested = false;

  coms.subscribe( config.es.channel, _handleJob );

}

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}


function setComs( c ) {

  coms = c;

}


function _handleJob( err, job ) {

  if ( _onStart ) _onStart();

  var formatted; // for parsed job

  log( 'handling job' );

  if ( err ) {

    return _handleError( err );

  }

  // parse the thing

  formatted = _parseJob( job );

  if ( !formatted ) return;


  // handle the thing

  jobHandlers[ formatted.jobName ]( formatted, function( err, result ) {

    if ( err ) {

      _handleError( err );

      return;

    }

    log( 'job %s was successfully done', formatted.jobName );

    if ( _onComplete ) _onComplete( null, formatted );

  } );

}


function _rebuild( job, cb ) {

  async.series([
    ES.resetIndex,
    _populateES( 'events' ),
    _populateES( 'reviews' )
  ], cb );

}


function _populateES( schema ) {

  var type = ( schema == 'events' ? 'event' : 'review' );

  return function( cb ) {

    var loopCount = 1;

    log( 'populating type %s', type );

    _loopThroughPages( schema, function( results, next ) {

      log( 'looping %s', loopCount++ );

      ES[ schema ]().bulk( results, function( err, result ) {

        if ( err ) return cb( err );

        next();

      });

    }, cb );

  };

}


function _loopThroughPages( schema, usageFunc, finishCallback ) {

  var fetchPage = function( offset,limit ) {

    log( 'fetching data with offset %s', offset );

    model[ schema ]().list({
      extended: true,
      offset: offset,
      limit : limit
    }, function( err, result ) {

      if ( err || !result || !result.length ) return finishCallback( err );

      usageFunc( result, function() {
        
        fetchPage( offset + limit, limit );

      });

    });

  };

  fetchPage( 0, 40 );

}


function _publish( schema ) {

  return function( job, cb ) {

    log( 'publishing %s %s', job.type, job.id );

    model[ schema ]().get( { id : job.id }, function( err, obj ) {

      if ( err ) return cb( err );

      ES[ schema ]().insert( obj, cb );

    } );

  }

}


function _update( schema ) {

  return function( job, cb ) {

    log( 'updating %s %s', job.type, job.id );

    model[ schema ]().get( { id : job.id }, function( err, obj ) {

      if ( err ) return cb( err );

      ES[ schema ]().update( obj, cb );

    });

  }

}


function _delete( schema ) {

  return function( job, cb ) {

    log( 'removing %s %s', job.type, job.id );

    ES[ schema ]().remove( job.id, cb );

  }

}


/**
 * wrap things up
 */

function _handleError() {

  var args = Array.prototype.slice.call( arguments );

  log.apply( null, args );

  if ( _onComplete ) _onComplete( 'error' );

}


/**
 * read and extract job data
 */

function _parseJob( job ) {

  var data;

  if ( typeof job == 'string' ) {

    try {

      data = JSON.parse( job );

    } catch( e ) {

      _handleError( 'could not parse job "%s"', job );

      return false;

    }

  } else {

    data = job

  }

  if ( !jobHandlers[ data.name ] ) {

    _handleError( 'received unhandled job "%s"', data.name );

    return false;

  }

  return {

    jobName: data.name,

    type: data.name.split('.').shift(),

    name: data.name.split('.').pop(),

    id: data.value ? data.value.id : null,

  };

}