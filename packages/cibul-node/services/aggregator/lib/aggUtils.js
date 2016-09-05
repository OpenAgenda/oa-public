"use strict";

var p = require( '../../../lib/promises' ),

async = require( 'async' ),

agendaSvc, eventSvc;

module.exports = {
  loadAgenda,
  loadEvent,
  getAllAggregatorIds
}


/**
 * the agendas aggregating the agenda and the agendas aggregating those and so on
 */
function getAllAggregatorIds( agendaId, cb ) {

  let aggregatorIds = [],

  processQueue = [ agendaId ];

  async.doWhilst( wcb => {

    agendaSvc.get( { id: processQueue.pop() }, ( err, agenda ) => {

      if ( err ) return wcb( err );

      agenda.getAggregators( ( err, aggs ) => {

        if ( err ) return wcb( err );

        // aggregators of current agenda
        let aggIds = aggs.map( agg => agg.id )

        // filter out those already in the loaded list
        .filter( aggId => aggregatorIds.indexOf( aggId ) === -1 );

        // concatenate ids to queue and aggregatorIds
        aggregatorIds = aggregatorIds.concat( aggIds );

        processQueue = processQueue.concat( aggIds );

        wcb();

      } );

    } );

  },() => processQueue.length, err => {

    if ( err ) return cb( err );

    cb( null, aggregatorIds );

  } );

}


function loadEvent( v ) {

  _pre();

  return p.w.promise( function( rs, rj ) {

    eventSvc.get( { id: v.eventId }, ( err, event ) => {

      if ( err || !event ) {

        return rj( err || 'no event was found' );

      }

      v.event = event;

      rs( v );

    });

  });

}

function loadAgenda( namespace, identifier ) {

  _pre();

  return function( v ) {

    return p.w.promise( function( rs, rj ) {

      agendaSvc.get( { id: v[ identifier ] }, function( err, agenda ) {

        if ( err || !agenda ) return rj( err || 'no agenda was found' );

        v[ namespace ] = agenda;

        rs( v );

      } );

    });

  }

}

/**
 * prevent circular dependencies error
 */

function _pre() {

  if ( agendaSvc ) return;

  agendaSvc = require( '../../agenda' );

  eventSvc = require( '../../event' );

}