"use strict";

const config = require( '../../../config' ),

  q = require( '@openagenda/queue' )( config.queues.groupActions, { redis: config.redis } ),

  svc = require( '../' ),

  eventSvc = require( '../../event' ),

  agendaEvents = require( '@openagenda/agenda-events' ),

  async = require( 'async' ),

  utils = require( '@openagenda/utils' ),

  log = require( '@openagenda/logs' )( 'groupactions - tasks' ),

  w = require( 'when' ),

  model = require( '../../model' );

q.setConsumer( process );

module.exports = launch;

utils.extend( module.exports, {
  shutdown: shutdown,
  dispatchChangeEventStates: dispatchChangeEventStates,
  changeEventState: changeEventState
} );

function launch() {

  log( 'launching' );

  q.launch();

}

function shutdown() {

  q.shutdown();

}

function process( data, cb ) {

  if ( !data.method ) {

    log( 'error', 'method is missing' );

    return cb();

  }

  if ( !module.exports[ data.method ] ) {

    log( 'error', 'method is unkown' );

    return cb();

  }

  data.args.push( function( err ) {

    if ( err ) log( 'error', err );

    cb();

  } );

  module.exports[ data.method ].apply( null, data.args );

}



function dispatchChangeEventStates( agendaId, oldState, newState, options, cb ) {

  log( 'dispatchChangeEventStates: agenda %s from state %s to state %s with options %s', agendaId, oldState, newState, JSON.stringify( options ) );

  svc.get( { id: agendaId }, ( err, agenda ) => {

    let count = 0, offset = 0, hasMore = true;

    if ( err ) return cb( err );

    log( 'dispatchChangeEventStates: starting dispatch' );

    // a stream is wasteful; a query on review_article is sufficient.

    async.whilst( () => hasMore, wcb => {

      let query = {
        str: 'select * from review_article where state = ? and review_id=? limit ?, 100',
        params: [ oldState, agendaId, offset ]
      }

      // to be completed state includes null or 0 states
      if ( oldState === 0 ) {

        query = {
          str: 'select * from review_article where ( state = 0 or state is null ) and review_id = ? limit ?, 100',
          params: [ agendaId, offset ]
        }

      }

      model.lib.query( query.str, query.params, ( err, ras ) => {

        if ( err ) return wcb( err );

        if ( !ras.length ) {

          hasMore = false;

          return wcb();

        }

        offset += 100;

        async.eachSeries( ras, ( ra, ecb ) => {

          count++;

          q( {
            method: 'changeEventState',
            args: [ ra.review_id, ra.event_id, oldState, newState, options ]
          }, ecb );

        }, wcb );

      } );

    }, err => {

      if ( err ) {

        log( 'error', 'dispatchChangeEventStates: failed - %s', err );

      }

      log( 'dispatchChangeEventStates: dispatched %s jobs', count );

      cb();

    } );

  } );

}

function changeEventState( agendaId, eventId, oldState, newState, options, cb ) {

  if ( arguments.length === 4 ) {

    cb = newState;

    newState = oldState;

    oldState = false;

  }

  if ( arguments.length === 5 ) {

    cb = options;

    options = {};

  }

  log( 'changeEventState for agenda %s, event %s', agendaId, eventId );

  w( {
    agendaId,
    eventId,
    oldState,
    newState,
    agenda: false,
    event: false,
    currentState: false,
    doChange: false
  } )

  .then( _loadAgenda )

  .then( _loadEvent )

  .then( _getCurrentState )

  .then( _verifyOldStateMatch )

  .done( v => {

    if ( !v.doChange ) {

      return cb();

    } else {

      log( 'changeEventState for agenda %s, event %s: changing state to %s', agendaId, eventId, newState );

      v.event.setState( newState, async ( err, result, states ) => {

        if ( err ) return cb( err );

        try {

          await agendaEvents( v.agenda.uid ).update( v.event.uid, { state: newState }, options );

        } catch ( e ) {

          log( 'error', 'failed to sync with agendaEvent %s.%s', v.agenda.uid, v.event.uid );

        }

        cb( null, result, states );

      } );

    }

  }, cb );

}


function _verifyOldStateMatch( v ) {

  if ( !v.event ) return v;

  if ( v.oldState === false ) {

    v.doChange = true;

  } else if ( v.oldState === v.currentState ) {

    v.doChange = true;

  }

  return v;

}


function _getCurrentState( v ) {

  if ( !v.event ) return v;

  const d = w.defer();

  v.event.getState( { labelized: false }, ( err, state ) => {

    if ( err ) return d.reject( err );

    v.currentState = state;

    d.resolve( v );

  } );

  return d.promise;

}


function _loadAgenda( v ) {

  const d = w.defer();

  svc.get( { id: v.agendaId }, ( err, agenda ) => {

    if ( err ) return d.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  } );

  return d.promise;

}


function _loadEvent( v ) {

  const d = w.defer();

  eventSvc.get( { id: v.eventId }, ( err, event ) => {

    if ( err ) return d.reject( err );

    if ( !event ) {

      log( 'error', 'event could not be loaded: %s', v.eventId );

      return d.reject( err );

    }

    event.loadAgendaContext( v.agendaId, err => {

      if ( err ) return d.reject( err );

      v.event = event;

      d.resolve( v );

    } );

  } );

  return d.promise;

}
