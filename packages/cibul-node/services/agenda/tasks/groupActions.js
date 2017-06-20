"use strict";

var config = require( '../../../config' ),

q = require( 'queue' )( config.queues.groupActions, { redis: config.redis } ),

svc = require( '../' ),

eventSvc = require( '../../event' ),

utils = require( 'utils' ),

log = require( 'logger' )( 'groupactions - tasks' ),

w = require( 'when' );

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



function dispatchChangeEventStates( agendaId, oldState, newState, cb ) {

  log( 'dispatchChangeEventStates: agenda %s from state %s to state %s', agendaId, oldState, newState );

  svc.get( { id: agendaId }, function( err, agenda ) {

    var count = 0;

    if ( err ) return cb( err );

    log( 'dispatchChangeEventStates: starting event stream' );

    var stream = agenda.searchStream( { passed: 1 }, { showAll: 1 } );

    stream.on( 'data', function( eventData ) {

      stream.pause();

      q( {
        method: 'changeEventState',
        args: [ agendaId, eventData.eventId, oldState, newState ]
      }, function() {

        count++;

        stream.resume();

      } );

    } );

    stream.on( 'end', function() {

      log( 'dispatchChangeEventStates: dispatched %s jobs', count );

      cb();

    } );

  } );

}

function changeEventState( agendaId, eventId, oldState, newState, cb ) {

  if ( arguments.length === 4 ) {

    cb = newState;

    newState = oldState;

    oldState = false;

  }

  log( 'changeEventState for agenda %s, event %s', agendaId, eventId );

  w( {
    agendaId: agendaId,
    eventId: eventId,
    oldState: oldState,
    newState: newState,
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

      v.event.setState( newState, cb );

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

  let d = w.defer();

  v.event.getState( { labelized: false }, ( err, state ) => {

    if ( err ) return d.reject( err );

    v.currentState = state;

    d.resolve( v );

  } );

  return d.promise;

}


function _loadAgenda( v ) {

  let d = w.defer();

  svc.get( { id: v.agendaId }, ( err, agenda ) => {

    if ( err ) return d.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  } );

  return d.promise;

}


function _loadEvent( v ) {

  let d = w.defer();

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