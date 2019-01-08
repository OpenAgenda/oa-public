"use strict";

const aer = require( '@openagenda/agenda-event-references' ),

utils = require( '@openagenda/utils' ),

eventSvc = require( '../../event' ),

async = require( 'async' );

/**
 * for each agenda listing,
 * inject event reference uids when existing
 */
module.exports = function( data, cb ) {

  async.each( data.articles, ( a, ecb ) => {

    aer( a.review.id ).get( data.id, ( err, refIds ) => {

      if ( err ) return ecb( err );

      if ( !refIds.length ) return ecb();

      // load uids
      eventSvc.list( { ids: refIds, isPublished: null, limit: 200 }, ( err, events ) => {

        if ( err ) return ecb( err );

        a.references = events.map( e => e.uid );

        ecb();

      } );

    } );

  }, err => {

    if ( err ) return cb( err );

    cb();

  } );

}
