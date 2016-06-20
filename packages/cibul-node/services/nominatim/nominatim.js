var https = require('https'),

host = 'nominatim.openstreetmap.org',

geocodePath = '/search/{address}?format=json&addressdetails=1&limit=1&accept-language={language}&email={email}',

reversePath = '/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1&accept-language={language}&email={email}',

log = require( 'debug' )( 'nominatim' ),

lib = require( '../../lib/lib' );


/**
 * geocode ( address > lat/lng ) using nominatim
 */

module.exports.geocode = function( address, options, cb ) {

  if ( arguments.length==2 ) {

    cb = options;
    options = {};

  }

  var params = lib.extend({
    language: 'en',
    email: ''
  }, options ),

  path = geocodePath
    .replace( '{address}', encodeURIComponent( address ) )
    .replace( '{language}', params.language )
    .replace( '{email}', params.email )

  log( 'requesting: %s', path );

  _get( path, cb );
  
}


/**
 * reverse geocode using nominatim
 */

module.exports.reverse = function( latitude, longitude, options, cb ) {

  if ( arguments.length==3 ) {

    cb = options;
    options = {};

  }

  if ( !_verifyCoords( latitude, longitude ) ) {

    cb( 'location coordinates are invalid' );

    return;

  }

  var params = lib.extend({
    language: 'en',
    email: ''
  }, options ),

  path = reversePath
    .replace( '{latitude}', latitude)
    .replace( '{longitude}', longitude)
    .replace( '{language}', params.language )
    .replace( '{email}', params.email );


  log( 'requesting: %s', path );

  _get( path, cb );

};



/**
 * clean nominatim data, attempt to retrieve address, city, country, county and address pieces
 */

module.exports.clean = function(data) {

  var clean = {
    address: data.display_name,
    city: data.address.city,
    country: data.address.country,
    countryCode: data.address.country_code ? data.address.country_code.toUpperCase() : '',
    county: data.address.county,
    pieces: []
  };

  if (typeof data.address.city_district !== 'undefined') clean.cityDistrict = data.address.city_district;

  if (typeof data.address.postcode !== 'undefined') {
    clean.postalCode = data.address.postcode.split(';')[0];
  }

  // department between county and state
  
  var pieces = data.display_name.split(','), countyIndex, stateIndex;
  
  for (var i in pieces) {

    clean.pieces.push(pieces[i].trim());

  }

  if ((typeof clean.country == 'undefined') && lib.contains(clean.pieces, 'France métropolitaine')) clean.country = 'France';

  return clean;

};

function _get( path, cb ) {

  https.get( {
    host: host,
    path: path
  }, function( res ) {

    var body = '';

    res.on( 'data', function(chunk) {

      body += chunk;

    });

    res.on( 'end', function() {

      var result;

      try {

        result = JSON.parse( body );
        
      } catch( e ) {

        return cb( 'could not parse response: ' + body );

      }


      if ( result.error ) {

        return cb( result.error );

      }

      cb( null, result );

    });

    res.on( 'error', function( e ){

      cb( e.message );

    });

  });

}


function _verifyCoords( lat, lng ) {

  if ( !parseFloat( lat ) ) return false;

  if ( !parseFloat( lng ) ) return false;

  return true;

}