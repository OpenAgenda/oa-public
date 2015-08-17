"use strict";

var config = require( '../../../config' ),

q = require( 'queue' )( config.queues.groupActions, { redis: config.redis } ),

svc = require( '../' ),

eventSvc = require( '../../event' ),

utils = require( 'utils' ),

log = require( 'logger' )( 'groupactions - tasks' );

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



function dispatchChangeEventStates( agendaId, newState, cb ) {

  log( 'dispatchChangeEventStates: agenda %s state %s', agendaId, newState );

  svc.get( { id: agendaId }, function( err, agenda ) {

    var count = 0;

    if ( err ) return cb( err );

    log( 'dispatchChangeEventStates: starting event stream' );

    var stream = agenda.searchStream( { passed: 1 }, { showAll: 1 } );

    stream.on( 'data', function( eventData ) {

      stream.pause();

      q( {
        method: 'changeEventState',
        args: [ agendaId, eventData.eventId, newState ]
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

function changeEventState( agendaId, eventId, newState, cb ) {

  log( 'changeEventState for agenda %s, event %s to state %s', agendaId, eventId, newState );

  svc.get( { id: agendaId }, function( err, agenda ) {

    if ( err ) return cb( err );

    eventSvc.get( { id: eventId }, function( err, event ) {

      if ( err ) return cb( err );

      event.loadAgendaContext( agendaId, function( err ) {

        if ( err ) return cb( err );

        log( 'changeEventState - setting state' );

        event.setState( newState, cb );

      });

    });

  });

}