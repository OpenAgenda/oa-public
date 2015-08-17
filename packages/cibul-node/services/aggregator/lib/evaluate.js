"use strict";

var agendaSvc = require( '../../agenda' ),

p = require( '../../../lib/promises' ),

aggUtils = require( './aggUtils' ),

log = require( 'logger' )( 'aggregator evaluate' );

module.exports = {
  publish: publish,
  unpublish: unpublish
}

function unpublish( eventId, sourceId, aggregatingAgendaId, cb ) {

  log( 'unpublish - evaluating for event %s, source %s, aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

  p.w( {
    eventId: eventId,
    sourceId: sourceId,
    aggregatingAgendaId: aggregatingAgendaId,
    aggregatingAgenda: null,
    hasRemainingReferences: null,
    removed: false
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( aggUtils.loadEvent )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  .then( p.ife( { referenced: true }, _removeSourceReference ) )

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


function publish( eventId, sourceId, aggregatingAgendaId, cb ) {

  log( 'publish - evaluating for event %s, source %s, aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

  p.w( {
    eventId: eventId,
    sourceId: sourceId,
    aggregatingAgendaId: aggregatingAgendaId,
    referenced: null,
    referencedBySource: null,
    added: false
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatingAgenda', 'aggregatingAgendaId' ) )

  .then( aggUtils.loadEvent )

  .then( _checkSourceReference )

  .then( _checkIfReferenced )

  .then( p.ife( { referenced: true }, _checkIfReferencedBySource ) )

  .then( p.ife( { referenced: true, referencedBySource: true }, _addNewSourceReference ) )

  .then( p.ife( { referenced: false }, _addEventToAggregator ) )

  .done( function( v ) {

    if ( v.added ) {

      log( 'publish - add event %s of source %s to aggregating agenda %s', eventId, sourceId, aggregatingAgendaId );

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

      if ( !has ) return rj( 'event ' + v.event.id + ' is not listed in source agenda ' + v.agenda.id );

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

  return p.w.promise( function( rs, rj ) {

    v.event.addSource( v.sourceAgenda.id, function( err ) {

      if ( err ) return rj( err );

      rs( v );

    });

  });

}

function _removeSourceReference( v ) {

  return p.w.promise( function( rs, rj ) {

    v.event.removeSource( v.sourceAgenda.id, function( err ) {

      if ( err ) return rj( err );
      
      v.event.getSources( function( err, sources ) {

        if ( err ) return rj( err );
        
        v.hasRemainingReferences = !!sources.length;

        log( 'has remaining references? %s', v.hasRemainingReferences ? 'yes' : 'no' );

        rs( v );

      });

    });

  });

}


function _removeFromAggregator( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatingAgenda.removeEvent( v.event, function( err, result ) {

      if ( err ) return rj( err );

      v.removed = true;

      rs( v );

    });

  });

}


/**
 * assuming event is not already listed, add event to the aggregating agenda
 */

function _addEventToAggregator( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatingAgenda.addEvent( v.event, { id: v.aggregatingAgenda.ownerId }, function( err ) {

      if ( err ) return rj( err );

      v.event.loadAgendaContext( v.aggregatingAgendaId, function( err ) {

        if ( err ) return rj( err );

        v.event.addSource( v.sourceId, function( err, result ) {

          if ( err ) return rj( err );

          v.added = true;

          rs( v );

        } );

      } );

    });

  } );

}