"use strict";

var utils = require( '@openagenda/utils' ),

lib, // to be set

async = require( 'async' ),

log = require( '@openagenda/logs' )( 'services/elasticsearch/refresh' ),

model = require( '../../model' );

module.exports = run;

utils.extend( module.exports, {
  set: set
} );


function run( done ) {

  log( 'refreshing elasticsearch event relative times' );

  _loopThroughUpcoming( ( events, next ) => {

    /**
     * events needing to be refreshed are the ones having
     * upcoming occurrences & a nextTimingStart that just passed
     */

    async.eachSeries( events, ( e, ecb ) => {

      model.events().get( { id: e.eventId }, ( err, dbRef ) => {

        if ( err || !dbRef ) {

          if ( err ) log( 'error', err );

          if ( !dbRef ) log( 'error', 'db entry for event %s was not found', e.eventId );

          return ecb();

        }

        lib.events().update( dbRef, err => {

          if ( err ) log( 'error', err );

          log( 'refreshed event %s', dbRef.id );

          return ecb();

        } );

      });

    }, next );

  }, ( err ) => {

    if ( err ) return log( 'error', err );

    log( 'done' );

    if ( done ) done();

  } );

}

function set( l ) {

  lib = l;

}

function _loopThroughUpcoming( cb, done ) {

  if ( !lib ) return done( 'es lib is not set' );

  var limit = 20, offset = 0, total = false;

  async.doWhilst( ( wcb ) => {

    lib.events().search( {
      requireRefresh: true,
      options: {
        from: offset,
        size: limit
      }
    }, ( err, result ) => {

      if ( err ) {

        return wcb( err );

      }

      if ( total === false ) {

        total = result.total;

        log( 'info', '%s events to be processed', total );

      }

      cb( result.data, () => {

        offset += limit;

        wcb();

      } );

    } );

  }, () => {

    return offset < total;

  }, done );


}
