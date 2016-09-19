"use strict";

var p = require( '../../../lib/promises' ),

aggUtils = require( './aggUtils' ),

q,

logger = require( 'logger' ), log;


/**
 * create jobs to evaluate addition of event in each
 * aggregator of source agenda and queue
 */

module.exports = {
  publish,
  unpublish,
  set
}

function unpublish( eventId, agendaId, cb ) {

  _init();

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

  .done( v => {

    log( 'unpublish - dispatched %s evaluates', v.aggregatorAgendaIds.length );

    cb( null, v.aggregatorAgendaIds.length );

  }, cb );

}


function publish( eventId, agendaId, mute, cb ) {

  _init();

  if ( arguments.length === 3 && typeof mute === 'function' ) {

    cb = mute;
    mute = false;

  } 

  log( 'publish event %s on source %s', eventId, agendaId );

  if ( !cb ) {

    log( 'queueing' );

    return q( {
      method: 'notify.publish',
      args: [ eventId, agendaId, mute ]
    } );

  }

  p.w( {
    mute,
    agendaId,
    eventId,
    agenda: false,
    aggregatorAgendaIds: []
  } )

  .then( aggUtils.loadAgenda( 'agenda', 'agendaId' ) )

  .then( _loadAggregatorAgendaIds )

  .then( _dispatch( 'evaluate.publish' ) )

  .done( v => {

    log( 'publish - dispatched %s evaluates', v.aggregatorAgendaIds.length )

    cb( null, v.aggregatorAgendaIds.length );

  }, cb );

}

function set( config ) {

  q = config.q;

}


function _dispatch( method ) {

  return v => {

    return p.w.map( v.aggregatorAgendaIds, function( aggAgendaId ) {

      return p.w.promise( ( rs, rj ) => {

        q( {
          method: method,
          args: [ v.eventId, v.agendaId, aggAgendaId, v.mute ]
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

    v.event.getAgendaReferences( { internal: true, isPublished: null }, ( err, refs ) => {

      log( 'retrieved %s agenda references for event %s', refs.length, v.event.id );

      v.aggregatorAgendaIds = refs

        .filter( r => r.sourceIds && r.sourceIds.indexOf( v.agendaId ) !== -1 )

        .map( r => r.id );

      log( 'got %s aggregator ids', v.aggregatorAgendaIds.length );

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


function _init() {

  if ( log ) return;

  log = logger( 'services/aggregator/notify' );

}