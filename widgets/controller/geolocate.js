"use strict";

module.exports = function( ctlData, initValues, cb ) {

  var requestTimeout;

  if ( initValues.lat && initValues.lng ) return cb( null, [ initValues.lat, initValues.lng ] );

  if ( !_hasFeature() ) return cb( 'navigator cannot geolocate' );

  if ( !initValues.count ) initValues.count = 5;

  initValues.count = Math.min( initValues.count, 50 );

  requestTimeout = setTimeout( function() {
    cb( 'user did not respond to geolocate' );
  }, 5000 );

  _requestGeolocation( function( err, coords ) {

    clearTimeout( requestTimeout );

    if ( err ) return cb( err );

    // find distance from point encompassing the count locations
    
    var closest = _extractClosest( ctlData.l, coords, initValues.count ),

    boundParams = _determineBounds( closest );

    cb( null, boundParams );

  } );

}


function _determineBounds( locations ) {

  var neLat = false, neLng = false,

  swLat = false, swLng = false,

  lat, lng;

  for ( var l in locations ) {

    var lat = locations[ l ].lt,

    lng = locations[ l ].lg;

    if ( !neLat ) {
      
      neLat = swLat = lat;

      neLng = swLng = lng;

    } else {

      if ( lat > neLat ) neLat = lat;

      if ( lat < swLat ) swLat = lat;

      if ( lng > neLng ) neLng = lng;

      if ( lng < swLng ) swLng = lng;

    }

  }

  return {
    neLat: neLat,
    neLng: neLng,
    swLat: swLat,
    swLng: swLng
  }

}


/**
 * given a lat/lng pair and a list of locations, find the 'count' first locations
 */

function _extractClosest( locations, coords, count, cb ) {

  var currentLocation, currentDistance,

  furthestDistance = false, closestDistances = [], newFurthest = false,

  closestLocations = {},

  processed = {};

  for (var i = locations.length - 1; i >= 0; i--) {

    currentLocation = locations[ i ];

    if ( typeof processed[ currentLocation.u ] == 'undefined' ) {

      currentDistance = parseInt( _distance( currentLocation.lt, currentLocation.lg, coords[ 0 ], coords[ 1 ] ), 10 );

      if ( ( closestDistances.length >= count ) && ( currentDistance < furthestDistance ) ) {

        // one needs to go and be replaced

        newFurthest = currentDistance; // furthest is once again unknown


        for( var c in closestDistances ) {

          if ( closestDistances[ c ] == furthestDistance ) {

            // the furthest is out and replaced
            closestDistances[ c ] = currentDistance;
            closestLocations[ c ] = currentLocation;

          } else {

            if ( closestDistances[ c ] > newFurthest ) {

              // new furthest is found
              newFurthest = closestDistances[ c ];

            }

          }

        }

        furthestDistance = newFurthest;

      } else if ( closestDistances.length < count ) {
          
        closestDistances.push( currentDistance );

        closestLocations[ closestDistances.length - 1 ] = currentLocation;

        if ( !furthestDistance || ( currentDistance > furthestDistance ) ) {

          furthestDistance = currentDistance;

        }

      }

      processed[ currentLocation.u ] = true;

    }

  };

  return closestLocations;
  
}

function _distance( lat1, lon1, lat2, lon2 ) {
  
  var radlat1 = Math.PI * lat1 / 180,
  
  radlat2 = Math.PI * lat2 / 180,
  
  radlon1 = Math.PI * lon1 / 180,
  
  radlon2 = Math.PI * lon2 / 80,
  
  radtheta = Math.PI * (lon1-lon2)/180;
  
  return 60 * 1.1515 * 1609.344 * 180/Math.PI * Math.acos(Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));

}


function _requestGeolocation( cb ) {

  navigator.geolocation.getCurrentPosition( function ( pos ) {

    cb( null, [ pos.coords.latitude, pos.coords.longitude ] );

  }, function( err ) {

    cb( err.message );

  } );

}


function _hasFeature() {

  return 'geolocation' in navigator;

}