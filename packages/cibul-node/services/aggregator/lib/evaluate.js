"use strict";

var agendaSvc = require( '../../agenda' ),

p = require( '../../../lib/promises' ),

aggUtils = require( './aggUtils' ),

logger = require( 'logger' ), log;

module.exports = {
  publish,
  unpublish
}

function unpublish( eventId, sourceId, aggregatingAgendaId, mute, cb ) {

  _init();

  if ( arguments.length === 4 ) {

    cb = mute;

    mute = false;

  }

  log( 'unpublish - evaluating for event %s, source %s, aggregating agenda %s %s', eventId, sourceId, aggregatingAgendaId, mute ? 'mute' : '' );

  p.w( {
    eventId,
    sourceId,
    aggregatingAgendaId,
    mute,
    aggregatingAgenda: null,
    hasRemainingReferences: null,
    removed: false,
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( aggUtils.loadEvent )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  // start event change operations. First de-reference source agenda from aggregating agenda event
  .then( p.ife( { referenced: true }, _removeSourceReference ) )

  // if aggregating agenda event has no other source references, remove it; ( it was not added by other source )
  .then( p.ife( { referenced: true, referencedBySource: true, hasRemainingReferences: false }, _removeFromAggregator ) )

  .done( function( v ) {

    if ( v.removed ) {

      log( 'unpublish - removed event %s of source %s from aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    } else {

      log( 'unpublish - did nothing for event %s of source %s and aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    }

    cb( null, {
      removed: v.removed
    } );

  }, cb );

}


function publish( eventId, sourceId, aggregatingAgendaId, mute, cb ) {

  _init();

  if ( arguments.length === 4 ) {

    cb = mute;

    mute = false;

  }

  log( 'publish - evaluating for event %s, source %s, aggregating agenda %s %s', eventId, sourceId, aggregatingAgendaId, mute ? 'mute' : '' );

  p.w( {
    eventId,
    sourceId,
    aggregatingAgendaId,
    mute,
    referenced: null,
    referencedBySource: null,
    added: false,
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( aggUtils.loadEvent )

  .then( _checkSourceReference )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  .then( p.ife( { referenced: true, referencedBySource: true }, _addNewSourceReference ) )

  .then( p.ife( { referenced: false }, _addEventToAggregator ) )

  .done(  v => {

    if ( v.added ) {

      log( 'info', {
        message: 'publish - added event %s of source %s to aggregating agenda %s',
        type: 'eventadd',
        eventId,
        aggregatorAgendaId: v.aggregatingAgendaId,
        sourceAgendaId: sourceId,
      }, eventId, sourceId, aggregatingAgendaId );

    } else if ( v.referenced ) {

      log( 'publish - event %s of source %s already is in aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    } else {

      log( 'publish - nothing done for event %s of source %s to aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

    }
 
    cb( null, {
      alreadyReferenced: v.referenced,
      added: v.added
    } );

  }, cb );

}


/**
 * verify that source effectively references
 * this event
 */


function _checkSourceReference( v ) {

  return p.w.promise( function( rs, rj ) {

    v.sourceAgenda.hasEvent( v.event, function( err, has ) {

      if ( err ) return rj( err );

      if ( !has ) return rj( 'event ' + v.event.id + ' is not listed in source agenda ' + v.sourceAgenda.id );

      rs( v );

    } );

  });

}


/**
 * verify whether event is already listed ( published or not ) in aggregating agenda
 * and if is referenced because of other source agenda
 */

function _checkIfReferenced( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatingAgenda.hasEvent( v.event, function( err, has ) {

      if ( err ) return rj( err );

      if ( !has ) {

        v.referenced = false;

        rs( v );

      } else {

        v.event.loadAgendaContext( v.aggregatingAgendaId, function( err ) {

          v.referenced = true;

          if ( err ) return rj( err );

          rs( v );

        } );

      }

    });

  });

}


/**
 * assuming event is already referenced
 * check if it was referenced by a source
 * agenda
 */

function _checkIfReferencedBySource( v ) {

  // need a sources getter on the event instance here.

  return p.w.promise( function( rs, rj ) {

    v.event.getSources( function( err, sources ) {

      if ( err ) return rj( err );

      v.referencedBySource = !!sources.length;

      log( 'was referenced by a source' );

      rs( v );

    });

  } );

}


/**
 * assuming event is already listed, register source agenda as new source
 */

function _addNewSourceReference( v ) {

  let d = p.w.defer();

  log( 'adding source agenda %s reference to event %s', v.sourceAgenda.id, v.event.id );

  v.event.addSource( {
    sourceId: v.sourceAgenda.id,
    mute: v.mute
  }, err => {

    if ( err ) return d.reject( err );

    log( 'source agenda id added to event %s', v.event.id );

    d.resolve( v );

  });

  return d.promise;

}




/**
 * remove source agenda from agendaEvent data. Event will no longer
 * be marked has having been added through said source
 */
function _removeSourceReference( v ) {

  let d = p.w.defer();

  v.event.removeSource( {
    sourceId: v.sourceAgenda.id,
    muteAgendas: v.mute
  }, err => {

    if ( err ) return d.reject( err );
    
    v.event.getSources( function( err, sources ) {

      if ( err ) return d.reject( err );
      
      v.hasRemainingReferences = !!sources.length;

      log( 'has remaining references? %s', v.hasRemainingReferences ? 'yes' : 'no' );

      d.resolve( v );

    });

  } );

  return d.promise;

}


/**
 * remove an event from an aggregating agenda ( an agenda where it was added by aggregation )
 */

function _removeFromAggregator( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatingAgenda.removeEvent( v.event, {
      mute: v.mute
    }, ( err, result ) => {

      if ( err ) return rj( err );

      log( 'info', {
        message: 'publish - removed event %s of source %s to aggregating agenda %s',
        type: 'eventremove',
        eventId: v.eventId,
        aggregatorAgendaId: v.aggregatingAgendaId,
        sourceAgendaId: v.sourceId,
      }, v.eventId, v.sourceId, v.aggregatingAgendaId );

      v.removed = true;

      rs( v );

    } );

  });

}


/**
 * assuming event is not already listed, add event to the aggregating agenda
 */

function _addEventToAggregator( v ) {

  let d = p.w.defer();

  v.aggregatingAgenda.addEvent( v.event, {
    stakeholder: { id: v.aggregatingAgenda.ownerId },
    mute: v.mute
  }, err => {

    if ( err ) return d.reject( err );

    log( 'event %s added to aggregating agenda %s', v.event.id, v.aggregatingAgenda.id );

    v.event.loadAgendaContext( v.aggregatingAgendaId, err => {

      if ( err ) return d.reject( err );

      v.event.addSource( {
        sourceId: v.sourceId,
        muteAgendas: v.mute
      }, ( err, result ) => {

        log( 'source reference agenda %s added to event %s', v.sourceId, v.event.id );

        if ( err ) return d.reject( err );

        v.added = true;

        d.resolve( v );

      } );

    } );

  });

  return d.promise;

}


function _init() {

  if ( log ) return;

  log = logger( 'services/aggregator/evaluate' );

}