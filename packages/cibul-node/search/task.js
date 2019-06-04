"use strict";

/**
 * task that syncs elasticsearch index
 * as events and reviews are modified/added/deleted
 */


const _ = require( 'lodash' );
const async = require( 'async' );
const log = require( '@openagenda/logs' )( 'search task' );

const agendaSvc = require( '../services/agenda' );
const coms = require( '../lib/coms' );
const config = require( '../config' );
const esSvc = require( '../services/elasticsearch' );
const loadDetailedLocation = require( '../services/elasticsearch/lib/loadDetailedLocation' );
const loadEventReferences = require( '../services/elasticsearch/lib/loadEventReferences' );
const utils = require( '../lib/utils' );
const model = require( '../services/model' );

const ES = require( '@openagenda/es-node' )( config.es );

const jobHandlers = {
  'index.resync' : _resync,
  'legacy.es.event.remove' : _delete( 'events' ),
  'event.publish' : _publish( 'events' ),
  'event.create' : _publish( 'events' ),
  'event.delete' : _delete( 'events' ),
  'event.remove' : _delete( 'events' ),
  'search.update' : _update( 'events' ),
  'event.update' : _update( 'events' ),
  'review.publish' : _publish( 'reviews' ),
  'agenda.create' : _publish( 'reviews' ),
  'review.delete' : _delete( 'reviews' ),
  'review.update' : _update( 'reviews' ),
  'agenda.update' : _update( 'reviews' ),
  'review.sync': _sync
};

let running = false;

let _onStart;

let _onComplete;

module.exports = run;

// for testing
utils.extend( module.exports, {
  setOnStart,
  setOnComplete,
  unsetOnComplete,
  setComs
} );


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

  log( 'debug', 'handling job' );

  if ( err ) {

    return _handleError( err );

  }

  // parse the thing

  const formatted = _parseJob( job );

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

function _resync( job, cb ) {

  esSvc.resync( job.values, function(  ) {

    cb();

  });

}

function _sync( job, cb ) {

  let hasMore = true, limit = 20, offset = 0;

  agendaSvc.get( job.values, function( err, agenda ) {

    if ( err ) return cb( err );

    log( 'info', 'syncing agenda %s', agenda.slug );

    // retrieve indexed events

    let hasMore = true, offset = 0, eIds = [];

    async.whilst( function() { return hasMore; }, function( wcb ) {

      agenda.search( { passed: 1, showAll: true }, { offset, limit }, function( err, data ) {

        eIds = utils.unique( eIds.concat( data.events.map( function( e ) { return parseInt( e.id.split( '@' )[0], 10 ); } ) ) );

        offset += limit;

        hasMore = !!data.events.length;

        wcb();

      });

    }, function( err ) {

      if ( err ) return cb( err );

      log( 'info', 'will update %s indexed events for agenda %s', eIds.length, agenda.slug );

      // retrieve db events

      hasMore = true;

      offset = 0;

      async.whilst( function() { return hasMore; }, function( wcb ) {

        agenda.events.list( {
          offset,
          limit: 1,
          isPublished: null
        }, function( err, events ) {

          if ( err ) return cb( err );

          if ( events.length && ( eIds.indexOf( events[ 0 ].id ) == -1 ) ) {

            eIds.push( events[ 0 ].id );

            log( 'info', 'added event %s to be indexed for agenda %s. %s events to be indexed', events[ 0 ].id, agenda.slug, eIds.length );

          }

          offset += 1;

          hasMore = !!events.length;

          wcb();

        });

      }, function( err ) {

        if ( err ) return cb( err );

        log( 'info', 'syncing %s events for agenda %s', eIds.length, agenda.slug );

        async.eachSeries( eIds, function( id, ecb ) {

          try {

            log( 'info', 'sending event.update for event %s', id );

            coms.publish( config.mainChannel, {
              name: 'event.update',
              values: { id }
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


function _publish( schema ) {

  return ( job, cb ) => {

    const identifiers = job.uid ? { uid: job.uid } : { id: job.id };

    log( 'info', 'publishing/creating %s %s %j', schema, job.type, identifiers );

    if ( !identifiers.uid && !identifiers.id ) {

      return cb( 'job ' + job.jobName + ' identifiers are not defined' );

    }


    model[ schema ]().get( identifiers, function( err, obj ) {

      if ( err ) {

        return cb( err );

      }

      if ( obj === undefined ) {

        return cb( 'event of id ' + JSON.stringify( identifiers ) + ' was not found' );

      }

      if ( schema === 'reviews' ) {

        return _doPublish( schema, obj, cb );

      }

      loadDetailedLocation( obj, err => {

        // for events, detailed location data must be fetched
        // via agenda-location service.

        if ( err ) {

          log( 'error', 'could not load detailed location data in event %s', obj.id );

        }

        loadEventReferences( obj, err => {

          if ( err ) {

            log( 'error', 'could not load reference data in event %s', obj.id );

          }

          _doPublish( schema, obj, cb );

        } );

      } );

    } );

  }

}


function _doPublish( schema, obj, cb ) {

  ES[ schema ]().insert( obj, function( err, result ) {

    if ( err ) {

      cb( err );

    } else {

      log( 'info', 'search lib indexed event returning result: ' + JSON.stringify( result ) );

      cb();

    }

  } );

}


function _update( schema ) {

  return function( job, cb ) {

    log( 'updating %s %s', job.type, job.id );

    model[ schema ]().get( { id : job.id }, function( err, obj ) {

      if ( err ) return cb( err );

      if ( !obj ) return cb( 'no event was found for id ' + job.id );

      if ( schema === 'reviews' ) {

        _updateES( obj, cb )

      } else {

        loadDetailedLocation( obj, err => {

          // for events, detailed location data must be fetched
          // via agenda-location service.

          if ( err ) {

            log( 'error', 'could not load detailed location data in event %s', obj.id );

          }

          loadEventReferences( obj, err => {

            if ( err ) {

              log( 'error', 'could not load reference data in event %s', obj.id );

            }

            // removed events need to be updated too. Event delete is different from event remove.

            _updateES( obj, cb );

          } );

        } );

      }

    });

  }

  function _updateES( obj, cb ) {

    if ( obj ) {

      ES[ schema ]().update( obj, cb );

    } else {

      _delete( schema )( job, cb );

    }

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

  console.log( JSON.stringify( args ) );

  log( 'error', JSON.stringify( args ) );

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

  return _.assign( {

    jobName: data.name,

    type: data.name.split('.').shift(),

    name: data.name.split('.').pop(),

    values: data.values

  }, _.get( data, 'values.uid' ) ? {
    uid: data.values.uid
  } : {
    id: _.get( data, 'values.id', null )
  } );

}
