var http = require('http'),

templatePath = 'http://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1&accept-language={language}',

log = require( 'debug' )( 'nominatim' ),

lib = require( '../../lib/lib' );


/**
 * reverse geocode using nominatim
 */

module.exports.reverse = function( latitude, longitude, options, cb ) {

  if ( arguments.length==3 ) {

    callback = options;
    options = {};

  }

  if ( !_verifyCoords( latitude, longitude ) ) {

    cb( 'location coordinates are invalid' );

    return;

  }

  var params = lib.extend({
    language: 'en'
  }, options ),

  path = templatePath
    .replace( '{latitude}', latitude)
    .replace( '{longitude}', longitude)
    .replace( '{language}', params.language );


  log( 'requesting: %s', path );


  http.get( path, function( res ) {

    var body = '';

    res.on( 'data', function(chunk) {

      body += chunk;

    });

    res.on( 'end', function() {

      var result;

      try {

        result = JSON.parse( body );
        
      } catch( e ) {

        return cb( 'could not parse response' );

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

};



/**
 * clean nominatim data, attempt to retrieve address, city, country, county and address pieces
 */

module.exports.clean = function(data) {

  var clean = {
    address: data.display_name,
    city: data.address.city,
    country: data.address.country,
    countryCode: data.address.country_code.toUpperCase(),
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


function _verifyCoords( lat, lng ) {

  if ( !parseFloat( lat ) ) return false;

  if ( !parseFloat( lng ) ) return false;

  return true;

}