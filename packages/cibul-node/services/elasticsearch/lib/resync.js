"use strict";

var lib,

async = require( 'async' ),

model = require( '../../model' ),

utils = require( 'utils' ),

logger = require( 'logger' ), log,

loadDetailedLocation = require( './loadDetailedLocation' );

module.exports = function( options, cb ) {

  var params, operations = [];

  log = logger( 'services/elasticsearch/resync' );

  if ( arguments.length == 1 ) {

    cb = options;

    options = {};

  }

  params = utils.extend( {
    agendaId: false,
    isPublished: null,
    interval: 0,
    reset: false
  }, options );

  if ( params.reset ) {

    delete params.agendaId;

    operations.push( lib.resetIndex );

  }


  if ( params.agendaId ) {

    params.aggregatorId = params.agendaId;

    delete params.agendaId;

  } else {

    operations.push( _removeZombies( 'reviews' ) );

    operations.push( _update( 'reviews' ) );

  }

  operations.push( _removeZombies( 'events', params ) );

  operations.push( _update( 'events', params ) );

  operations.push( lib.refreshIndex );

  if ( !lib ) return cb( 'es is not inited' );

  async.series( operations, function( err ) {

    if ( params.aggregatorId ) {

      log( 'info', 'resync of agenda %s is complete', params.aggregatorId );

    } else {

      log( 'info', 'full resync is complete' );

    }

    cb();

  } );

}

module.exports.set = function( l ) {

  lib = l;

}






function _update( type, query ) {

  if ( !query ) query = {};

  return function( cb ) {

    var count = { processed: 0, errors: 0 };

    _loopThroughDb( type, query, function( dbRef, next ) {

      if ( type !== 'events' ) return _doUpdate( type, dbRef, count, next );

      // events type need to have detailed location fed by location service
      // before being indexed.
      
      loadDetailedLocation( dbRef, err => {

        if ( err ) log( 'error', 'could not load detailed location data in event %s', dbRef.id );

        _doUpdate( type, dbRef, count, next );

      } );

    }, function( err ) {

      if ( err ) log( 'error', err );

      _logUpdates( type, count );      

      cb( err );

    } );

  }

  function _doUpdate( type, obj, count, cb ) {

    lib[ type ]().update( obj, function( err ) {

      count.processed++;

      if ( err ) {

        log( 'error', 'es update error for %s: %s', type, JSON.stringify( err ) )

        count.errors++;

      }

      if ( count.processed % 1000 === 0 ) _logUpdates( type, count );

      _delay( query.interval, cb )();

    } );

  }

}

function _defineGetQuery( type, params, obj ) {

  var q = { id: obj[ type=='reviews' ? 'aggregatorId' : 'eventId' ] };

  if ( type == 'events' && params.aggregatorId ) {

    q.aggregatorId = params.aggregatorId;

  }

  return q;

}

function _removeZombies( type, params ) {

  if ( !params ) params = {};

  return ( cb ) => {

    var count = { processed: 0, removed: 0, errors: 0 };
    
    log( 'info', 'removing %s zombies', type );

    _loopThroughIndex( type, params, ( obj, next ) => {

      model[ type ]().get( _defineGetQuery( type, params, obj ), function( err, dbRef ) {

        if ( count.processed % 1000 === 0 ) _logZombies( type, count );

        count.processed++;

        if ( err ) {

          count.errors++;

          log( 'error', 'could not remove agenda from index: %s', err );

          return _delay( params.interval, next )();

        }

        if ( dbRef ) return _delay( params.interval, next )();

        log( 'info', 'removing %s zombie id %s', type, obj[ type=='reviews' ? 'aggregatorId' : 'eventId' ] );

        count.removed++;

        lib[ type ]().remove( obj[ type=='reviews' ? 'aggregatorId' : 'eventId' ], _delay( params.interval, next ) );

      } );

    }, function( err ) {

      if ( err ) return cb( err );

      _logZombies( type, count );

      cb();

    } );

  }

}

function _delay( sleep, next ) {

  if ( sleep === undefined ) {

    sleep = 0;

  }

  return function( err ) {

    setTimeout( function() {

      next( err );

    }, sleep );

  } 

}


function _logZombies( type, count ) {

  log( 'info', 'zombies - %s: processed %s, removed %s, errors %s', type, count.processed, count.removed, count.errors );

}

function _logUpdates( type, count ) {

  log( 'info', 'updates - %s: processed %s, errors %s', type, count.processed, count.errors );

}



function _loopThroughIndex( type, params, usageFunc, cb ) {

  var hasMore = true, limit = 40, offset = 0;

  async.whilst( function() {

    return hasMore;

  }, function( wcb ) {

    log( 'info', 'fetching in index %s offset %s', type, offset );

    lib[ type ]().search( utils.extend( { options: { from: offset, size: limit } }, params ), function( err, result ) {

      if ( err ) return wcb( err );

      hasMore = !!result.data.length;

      async.eachSeries( result.data, usageFunc, function( err ) {

        if ( err ) return wcb( err );

        offset += limit;

        wcb();

      } );

    } );

  }, cb );

}


function _loopThroughDb( schema, params, usageFunc, cb ) {

  var hasMore = true, limit = 100, offset = 0;

  async.whilst( function()  {

    return hasMore;

  }, function( wcb ) {

    log( 'info', 'fetching in db %s offset %s', schema, offset );

    model[ schema ]().list( utils.extend( {
      extended: true,
      offset: offset,
      limit : limit
    }, params ), function( err, result ) {

      if ( err ) return wcb( err );

      hasMore = !!result.length;

      async.eachSeries( result, usageFunc, function( err ) {

        if ( err ) return wcb( err );

        offset += limit;

        wcb();

      } );

    } );

  }, cb );

}
