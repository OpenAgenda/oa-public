"use strict";

var log = require( '../../lib/logger' )( 'location service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db ),

levenshtein = require( 'fast-levenshtein' ),

lib = require( '../../lib/lib' ),

imageSvc = require( '../image/image' ),

s3Svc = require( '../file/s3' ),

fileSvc = require( '../file/file' );


module.exports = {
  list: model.locations().list,
  update: model.locations().update,
  get: get,
  create: create,
  listSimilar: listSimilar, // take name, lat, lng.
}

module.exports.mw = require( './middleware' )( module.exports );


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

function get( params, cb ) {

  model.locations().get( params, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, result ? instanciate( result ) : null );

  });

}

function create( params, cb ) {

  model.locations().create( params, function( err, result ) {

    if ( err ) return cb( err );

    get( { id: result.id }, cb );

  });

}

function instanciate( data ) {

  var instance = model.locations().instance( data );

  return lib.extend( {}, instance, {
    setImage: setImage
  });

  function setImage( url, cb ) {

    // assuming event is created
    var name = 'location' + instance.uid;

    imageSvc.multi( {
      url: url
    }, [
      { name: name, format: { width: 300 } },
    ], function( err, imagePaths ) {

      if ( err ) return cb( err );

      s3Svc.store( imagePaths, function( err ) {

        if ( err ) return cb( err );

        instance.setImage( name + '.jpg', true, cb );

      });

    } );

  }

}