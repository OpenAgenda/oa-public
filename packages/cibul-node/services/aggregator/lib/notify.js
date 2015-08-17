"use strict";

var p = require( '../../../lib/promises' ),

aggUtils = require( './aggUtils' ),

q,

log = require( 'logger' )( 'aggregator notify' );

/**
 * create jobs to evaluate addition of event in each
 * aggregator of source agenda and queue
 */

module.exports = {
  publish: publish,
  unpublish: unpublish,
  set: set
}

function unpublish( eventId, agendaId, cb ) {

  log( 'unpublish event %s from source %s', eventId, agendaId );

  if ( !cb ) {

    log( 'queueing' );

    return q( {
      method: 'notify.unpublish',
      args: [ eventId, agendaId ]
    } );

  }

  p.w( {
    agendaId: agendaId,
    eventId: eventId,
    event: false,
    aggregatorAgendaIds: []
  } )

  .then( aggUtils.loadEvent )

  .then( _retrieveAgendaIdsFromSources ) 

  .then( _dispatch( 'evaluate.unpublish' ) )

  .done( function( v ) {

    log( 'unpublish - dispatched %s evaluates', v.aggregatorAgendaIds.length );

    cb( null, v.aggregatorAgendaIds.length );

  }, cb );

}


function publish( eventId, agendaId, cb ) {

  log( 'publish event %s on source %s', eventId, agendaId );

  if ( !cb ) {

    log( 'queueing' );

    return q( {
      method: 'notify.publish',
      args: [ eventId, agendaId ]
    } );

  }

  p.w( {
    agendaId: agendaId,
    eventId: eventId,
    agenda: false,
    aggregatorAgendaIds: []
  } )

  .then( aggUtils.loadAgenda( 'agenda', 'agendaId' ) )

  .then( _loadAggregatorAgendaIds )

  .then( _dispatch( 'evaluate.publish' ) )

  .done( function( v ) {

    log( 'publish - dispatched %s evaluates', v.aggregatorAgendaIds.length )

    cb( null, v.aggregatorAgendaIds.length );

  }, cb );

}

function set( config ) {

  q = config.q;

}


function _dispatch( method ) {

  return function( v ) {

    return p.w.map( v.aggregatorAgendaIds, function( aggAgendaId ) {

      return p.w.promise( function( rs, rj ) {

        q( {
          method: method,
          args: [ v.eventId, v.agendaId, aggAgendaId ]
        }, function( err ) {

          if ( err ) return rj( err );

          rs();

        });

      } );

    } )

    .then( function() {

      return v;

    });

  }

}


function _retrieveAgendaIdsFromSources( v ) {

  return p.w.promise( function( rs, rj ) {

    v.event.getAgendaReferences( { internal: true, isPublished: null }, function( err, refs ) {

      refs.forEach( function( r ) {

        if ( r.sourceIds.indexOf( v.agendaId ) !== -1 ) {

          v.aggregatorAgendaIds.push( r.id );

        }

      } );

      rs( v );

    });

  });

}



function _loadAggregatorAgendaIds( v ) {

  return p.w.promise( function( rs, rj ) {

    v.agenda.getAggregators( function( err, agendas ) {

      if ( err ) return rj( err );

      v.aggregatorAgendaIds = agendas.map( function( a ) { return a.id } );

      rs( v );

    });

  } );

}