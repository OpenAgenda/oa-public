"use strict";


var log = require( '../../lib/logger' )( 'location service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db ),

levenshtein = require( 'fast-levenshtein' ),

lib = require( '../../lib/lib' );

module.exports = {
  list: model.locations().list,
  update: model.locations().update,
  get: model.locations().get,
  create: model.locations().create,
  listSimilar: listSimilar, // take name, lat, lng.
}


/**
 * list similar locations - suspects of being duplicates
 *
 * this gets locations of a neighborhood ( 100m radius approx )
 * and measures the string distance of the name using levenshtein
 */

function listSimilar( name, latitude, longitude, options, cb ) {

  var params;

  if ( !cb ) {

    cb = options;

    options = {};

  }

  params = lib.extend( {
    levenshteinLimit: 7, // under or equal, string is considered similar
  });

  model.locations().getNeighbors( latitude, longitude, function( err, neighbors ) {

    // I have the neighbors, I need the title similarity
    if ( err ) return cb( err );

    if ( !neighbors.length ) return cb( null, [] );

    cb( null, neighbors.filter( function( n ) {

      return levenshtein.get( n.placename, name ) <= params.levenshteinLimit;

    } ) );

  });  

}