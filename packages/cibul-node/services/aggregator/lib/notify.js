"use strict";

const logger = require( '@openagenda/logger' );

// transitional external aggregator service
const svc = require( '@openagenda/aggregators' );

const p = require( '../../../lib/promises' );

const aggUtils = require( './aggUtils' );

let q, pQ, log;


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
    agendaId,
    eventId,
    event: false,
    aggregatorAgendas: []
  } )

  .then( aggUtils.loadEvent )

  .then( _retrieveAgendaIdsFromSources ) 

  .then( _dispatch( 'evaluate.unpublish' ) )

  .done( v => {

    log( 'unpublish - dispatched %s evaluates', v.aggregatorAgendas.length );

    cb( null, v.aggregatorAgendas.length );

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
    aggregatorAgendas: []
  } )

  .then( aggUtils.loadAgenda( 'agenda', 'agendaId' ) )

  .then( async v => {

    v.aggregatorAgendas = await svc.sources.get( v.agenda.uid ).aggregators.list();

    return v;

  } )

  .then( _dispatch( 'evaluate.publish' ) )

  .done( v => {

    log( 'publish - dispatched %s evaluates', v.aggregatorAgendas.length );

    cb( null, v.aggregatorAgendas.length );

  }, cb );

}

function set( config ) {

  q = config.q;

  pQ = config.pQ;

}


function _dispatch( method ) {

  return v => {

    return p.w.map( v.aggregatorAgendas, function( aggAgenda ) {

      return p.w.promise( ( rs, rj ) => {

        let queueFunc = q;

        if ( aggAgenda.credentials && aggAgenda.credentials.prioritizedAggregator ) {

          log( 'info', 'aggregator agenda %s is prioritized for event %s evaluation', aggAgenda.id, v.eventId );

          queueFunc = pQ;

        } else {

          log( 'aggregator agenda %s for event %s evaluation is standard-queued', aggAgenda.id, v.eventId );

        }

        queueFunc( {
          method,
          args: [ v.eventId, v.agendaId, aggAgenda.id, v.mute ]
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

      v.aggregatorAgendas = refs

        .filter( r => r.sourceIds && r.sourceIds.indexOf( v.agendaId ) !== -1 )

        .filter( r => r.id !== v.agendaId );

      log( 'got %s aggregator ids: %s', v.aggregatorAgendas.length, JSON.stringify( v.aggregatorAgendas.map( a => a.id ) ) );

      rs( v );

    });

  });

}



function _init() {

  if ( log ) return;

  log = logger( 'services/aggregator/notify' );

}