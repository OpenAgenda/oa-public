"use strict";

const aggUtils = require( './aggUtils' ),

  p = require( '../../../lib/promises' ),

  log = require( '@openagenda/logs' )( 'aggregator/sources' );

let q, pQ;

module.exports = {
  add,
  remove,
  process,

  // when called, forces update of agenda to signal for updating cache
  complete,

  set
}


function add( sourceId, aggregatorAgendaId, upcomingOnly, cb ) {

  p.w( {
    sourceId,
    aggregatorAgendaId,
    upcomingOnly,
    preexisting: null,
    loop: false,
    added: false
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatorAgenda', 'aggregatorAgendaId' ) )

  .then( _checkNoSource )

  .then( p.ife( { preexisting: false }, _checkNoLoop ) )

  .then( p.ife( { preexisting: false, loop: false }, _createSource ) )

  .then( p.ife( { added: true }, _dispatchProcessJob ) )

  .done( v => {

    if ( v.added ) {

      log( 'info', {
        message: 'agenda source %s was added to aggregating agenda %s',
        type: 'sourceadd',
        sourceAgendaId: sourceId,
        aggregatorAgendaId,
        upcomingOnly
      }, sourceId, aggregatorAgendaId );

    }

    cb( null, {
      added: v.added,
      loop: v.loop
    } );

  }, cb );

}

function remove( sourceId, aggregatorAgendaId, cb ) {

  p.w( {
    sourceId,
    aggregatorAgendaId,
    preexisting: null
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatorAgenda', 'aggregatorAgendaId' ) )

  .then( _removeSource )

  .done( v => {

    if ( v.removed ) {

      log( 'info', {
        message: 'agenda source %s was removed from aggregating agenda %s',
        type: 'sourceremove',
        sourceAgendaId: sourceId,
        aggregatorAgendaId
      }, sourceId, aggregatorAgendaId );

    }

    cb( null, {
      removed: v.removed
    } );

  }, cb );

}

function process( sourceId, aggregatorAgendaId, upcomingOnly, mute, cb ) {

  p.w( {
    sourceId,
    aggregatorAgendaId,
    upcomingOnly,
    mute,
    queuedCount: 0,
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( _streamEvaluates )

  .then( _dispatchProcessComplete )

  .done( function( v ) {

    cb( null, {
      queuedCount: v.queuedCount
    } );

  }, err => {

    log( 'process error: %s', err );

    cb( err );

  } );

}

function complete( agendaId, cb ) {

  log( 'info', { message: 'triggering refresh for agenda id %s', agendaId: agendaId }, agendaId );

  p.w( {
    agendaId,
    agenda: null
  } )

  .then( aggUtils.loadAgenda( 'agenda', 'agendaId' ) )

  .done( v => {

    v.agenda.refresh( cb );

  }, cb )

}


function set( config ) {

  q = config.q;

  pQ = config.pQ;

}


/**
 * verify that source does not already exist
 */

function _checkNoSource( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatorAgenda.getSources( function( err, sources ) {

      if ( err ) return rj( err );

      v.preexisting = !!sources.filter( function( s ) {

        return s.id == v.sourceAgenda.id;

      }).length;

      rs( v );

    } );

  } );

}


function _checkNoLoop( v ) {

  return new Promise( ( rs, rj ) => {

    // if source is an aggregator, check its sources to verify that they are not final agregators
    aggUtils.getAllAggregatorIds( v.aggregatorAgenda.id, ( err, ids ) => {

      if ( err ) return rj( err );

      v.loop = ids.includes( v.sourceAgenda.id );

      rs( v );

    } );

  } );

}

function _streamEvaluates( v ) {

  return p.w.promise( function( rs, rj ) {

    log( 'streaming events of source agenda id %s to add to aggregating agenda id %s', v.sourceAgenda.id, v.aggregatorAgendaId );

    const stream = v.sourceAgenda.searchStream( { passed: !v.upcomingOnly } );

    stream.on( 'data', eventData => {

      stream.pause();

      q( {
        method: 'evaluate.publish',
        args: [ eventData.eventId, v.sourceAgenda.id, v.aggregatorAgendaId, v.mute ]
      }, function( err ) {

        if ( err ) return rj( err );

        v.queuedCount++;

        stream.resume();

      } );

    });

    stream.on( 'end', function() {

      rs( v );

    } );

  });

}


/**
 * create source link between agendas
 */

function _createSource( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatorAgenda.addSource( v.sourceAgenda, function( err ) {

      if ( err ) return rj( err );

      v.added = true;

      rs( v );

    } );

  } );

}


/**
 * remove the source
 */

function _removeSource( v ) {

  return p.w.promise( function( rs, rj ) {

    v.aggregatorAgenda.removeSource( v.sourceAgenda, function( err ) {

      if ( err ) return rj( err );

      v.removed = true;

      rs( v );

    } );

  });

}


/**
 * create process job for adding source events to aggregator
 */

function _dispatchProcessJob( v ) {

  return p.w.promise( ( rs, rj ) => {

    // agenda updates should be muted
    const mute = true;

    q( {
      method: 'sources.process',
      args: [ v.sourceId, v.aggregatorAgendaId, v.upcomingOnly, mute ]
    }, err => {

      if ( err ) return rj( err );

      rs( v );

    });

  });

}


function _dispatchProcessComplete( v ) {

  const d = p.w.defer();

  log( 'dispatching source process completion for agenda id %s', v.aggregatorAgendaId );

  q( { method: 'sources.complete', args: [ v.aggregatorAgendaId ] } );

  aggUtils.getAllAggregatorIds( v.aggregatorAgendaId, ( err, ids ) => {

    if ( err ) return d.reject( err );

    log( 'dispatching delayed source process completion for aggregators of aggregator agenda %s: %s', v.aggregatorAgendaId, ids.join( ',' ) );

    ids.forEach( id => {

      q( {
        method: 'sources.complete',
        args: [ id ]
      }, { delay: 15 * 60 * 1000 } ); // delay for 15 minutes.

    } );

    d.resolve( v );

  } );

  return d.promise;

}
