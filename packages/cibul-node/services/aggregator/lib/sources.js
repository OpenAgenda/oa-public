"use strict";

var aggUtils = require( './aggUtils' ),

p = require( '../../../lib/promises' ),

q;

module.exports = {
  add: add,
  remove: remove,
  process: process,
  set: set
}


function add( sourceId, aggregatorAgendaId, upcomingOnly, cb ) {

  p.w( {
    sourceId: sourceId,
    aggregatorAgendaId: aggregatorAgendaId,
    upcomingOnly: upcomingOnly,
    preexisting: null,
    added: false
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatorAgenda', 'aggregatorAgendaId' ) )

  .then( _checkNoSource )

  .then( p.ife( { preexisting: false }, _createSource ) )

  .then( _dispatchProcessJob )

  .done( function( v ) {

    cb( null, {
      added: v.added
    } );

  }, cb );

}

function remove( sourceId, aggregatorAgendaId, cb ) {

  p.w( {
    sourceId: sourceId,
    aggregatorAgendaId: aggregatorAgendaId,
    preexisting: null
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( aggUtils.loadAgenda( 'aggregatorAgenda', 'aggregatorAgendaId' ) )

  .then( _removeSource )

  .done( function( v ) {

    cb( null, {
      removed: v.removed
    } );

  }, cb );

}

function process( sourceId, aggregatorAgendaId, upcomingOnly, cb ) {

  p.w( {
    sourceId: sourceId,
    aggregatorAgendaId: aggregatorAgendaId,
    upcomingOnly: upcomingOnly,
    queuedCount: 0
  } )

  .then( aggUtils.loadAgenda( 'sourceAgenda', 'sourceId' ) )

  .then( _streamEvaluates )

  .done( function( v ) {

    cb( null, {
      queuedCount: v.queuedCount
    })

  }, cb );

}

function set( config ) {

  q = config.q;

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


function _streamEvaluates( v ) {

  return p.w.promise( function( rs, rj ) {

    var stream = v.sourceAgenda.searchStream( { passed: !v.upcomingOnly } );
    
    stream.on( 'data', function( eventData ) {

      stream.pause();

      q( {
        method: 'evaluate.publish',
        args: [ eventData.eventId, v.sourceAgenda.id, v.aggregatorAgendaId ]
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

  return p.w.promise( function( rs, rj ) {

    q( {
      method: 'sources.process',
      args: [ v.sourceId, v.aggregatorAgendaId, v.upcomingOnly ]
    }, function( err ) {

      if ( err ) return rj( err );

      rs( v );

    });

  });

}