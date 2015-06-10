"use strict";

/**
 * task that syncs elasticsearch index 
 * as events and reviews are modified/added/deleted
 */


var log = require( '../lib/logger' )( 'search task' ),

async = require( 'async' ),

coms = require( '../lib/coms' ),

utils = require( '../lib/utils' ),

cmn = require( '../lib/commons-task' ),

agendaSvc = require( '../services/agenda/agenda' ),

config = require( '../config' ),

model = cmn.getCibulModel(),

ES = require( 'ES' )( config.es ),

running = false,

_onStart,

_onComplete,

jobHandlers = {
  'index.rebuild' : _rebuild,
  'event.publish' : _publish( 'events' ),
  'event.create' : _publish( 'events' ),
  'event.delete' : _delete( 'events' ),
  'event.update' : _update( 'events' ),
  'review.publish' : _publish( 'reviews' ),
  'review.delete' : _delete( 'reviews' ),
  'review.update' : _update( 'reviews' ),
  'review.sync': _sync
};



/**
 * exposed function list
 */

exports.load = cmn.makeLoad( run );
exports.run = run;

// for testing
exports.setOnStart = setOnStart;
exports.setOnComplete = setOnComplete;
exports.unsetOnComplete = unsetOnComplete;
exports.setComs = setComs;


function run() {

  if ( running ) {

    log( 'debug', 'already running' );

    return;

  }

  log( 'debug', 'running' );

  running = true;
  
  coms.subscribe( config.es.channel, _handleJob );

}

function setOnStart( cb ) {

  _onStart = cb;

}


function setOnComplete( cb ) {

  _onComplete = cb;

}


function unsetOnComplete() {

  _onComplete = false;

}


function setComs( c ) {

  coms = c;

}


function _handleJob( err, job ) {

  if ( _onStart ) _onStart();

  var formatted; // for parsed job

  log( 'debug', 'handling job' );

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

    log( 'debug', 'job %s was successfully done', formatted.jobName );

    if ( _onComplete ) _onComplete( null, formatted );

  } );

}

function _sync( job, cb ) {

  var hasMore = true, limit = 20, offset = 0;

  agendaSvc.get( job.values, function( err, agenda ) {

    if ( err ) return cb( err );

    log( 'syncing agenda %s', agenda.slug );

    // retrieve indexed events

    var hasMore = true, offset = 0, eIds = [];

    async.whilst( function() { return hasMore; }, function( wcb ) {

      agenda.search( { passed: 1, showAll: true }, { offset: offset, limit: limit }, function( err, data ) {

        eIds = utils.unique( eIds.concat( data.events.map( function( e ) { return parseInt( e.id.split( '@' )[0], 10 ); } ) ) );

        offset += limit;

        hasMore = !!data.events.length;

        wcb();

      });

    }, function( err ) {

      if ( err ) return cb( err );

      log( 'will update %s indexed events for agenda %s', eIds.length, agenda.slug );

      // retrieve db events

      hasMore = true;

      offset = 0;

      async.whilst( function() { return hasMore; }, function( wcb ) {

        agenda.events.list( { offset: offset, limit: 1, isPublished: null }, function( err, events ) {

          if ( err ) return cb( err );

          if ( events.length && ( eIds.indexOf( events[ 0 ].id ) == -1 ) ) {

            eIds.push( events[ 0 ].id );

            log( 'added event %s to be indexed for agenda %s. %s events to be indexed', events[ 0 ].id, agenda.slug, eIds.length );

          }

          offset += 1;

          hasMore = !!events.length;

          wcb();

        });

      }, function( err ) {

        if ( err ) return cb( err );

        log( 'syncing %s events for agenda %s', eIds.length, agenda.slug );

        async.eachSeries( eIds, function( id, ecb ) {

          try {

            coms.publish( config.mainChannel, {
              name: 'event.update', 
              values: { id: id } 
            } );
            
          } catch( e ) {

            log( 'error', e );

          }

          // because redis will crash eventually
          setTimeout( function() { ecb() }, 100 );

        }, cb );

      } );

    } )

  } );

}


function _rebuild( job, cb ) {

  async.series([
    ES.resetIndex,
    _populateES( 'reviews' ),
    _populateES( 'events' )
  ], cb );

}


function _populateES( schema ) {

  var type = ( schema == 'events' ? 'event' : 'review' );

  var params = schema == 'events' ? { isPublished: null } : {};

  return function( cb ) {

    var loopCount = 1;

    log( 'debug', 'populating type %s', type );

    _loopThroughPages( schema, params, function( results, next ) {

      log( 'debug', 'looping %s', loopCount++ );

      ES[ schema ]().bulk( results, function( err, result ) {

        if ( err ) return cb( err );

        next();

      });

    }, cb );

  };

}


function _loopThroughPages( schema, params, usageFunc, finishCallback ) {

  if ( arguments.length === 3 ) {

    finishCallback = usageFunc;

    usageFunc = params;

    params = {};

  }

  var fetchPage = function( offset,limit ) {

    log( 'debug', 'fetching data with offset %s', offset );

    model[ schema ]().list( utils.extend( {
      extended: true,
      offset: offset,
      limit : limit
    }, params ), function( err, result ) {

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

    log( 'info', 'publishing/creating %s %s', job.type, job.id );

    if ( job.id === undefined ) {

      return cb( 'job ' + job.jobName + ' id is not defined' );

    }

    model[ schema ]().get( { id : job.id }, function( err, obj ) {

      if ( err ) {

        return cb( err );

      }

      if ( obj === undefined ) {

        return cb( 'event of id ' + job.id + ' was not found' );

      }

      ES[ schema ]().insert( obj, function( err, result ) {

        if ( err ) {

          cb( err );

        } else {

          log( 'info', 'search lib indexed event returning result: ' + JSON.stringify( result ) );

          cb();

        }

      } );

    } );

  }

}


function _update( schema ) {

  return function( job, cb ) {

    log( 'updating %s %s', job.type, job.id );

    model[ schema ]().get( { id : job.id }, function( err, obj ) {

      if ( err ) return cb( err );

      if ( obj ) {

        ES[ schema ]().update( obj, cb );

      } else {

        _delete( schema )( job, cb );

      }


    });

  }

}


function _delete( schema ) {

  return function( job, cb ) {

    log( 'debug', 'removing %s %s', job.type, job.id );

    ES[ schema ]().remove( job.id, cb );

  }

}


/**
 * wrap things up
 */

function _handleError() {

  var args = Array.prototype.slice.call( arguments );

  args.splice( 0, 0, 'error' );

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

    id: data.values ? data.values.id : null,

    values: data.values

  };

}