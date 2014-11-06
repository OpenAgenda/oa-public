var http = require('http'),

templatePath = 'http://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1&accept-language={language}',

log = require( 'debug' )( 'nominatim' );


/**
 * reverse geocode using nominatim
 */

module.exports.reverse = function( latitude, longitude, options, cb ) {

  if ( arguments.length==3 ) {

    callback = options;
    options = {};

  }

  var params = lib.extend({
    language: 'en'
  }, options ),

  path = templatePath
    .replace('{latitude}', latitude)
    .replace('{longitude}', longitude)
    .replace('{language}', params.language );

  http.get( path, function( res ) {

    var body = '';

    res.on( 'data', function(chunk) {

      body += chunk;

    });

    res.on( 'end', function() {

      var result = JSON.parse( body );

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


var lib = {
  forEach: function(array, action) {
    for (var i = 0; i < array.length; i++)
      action(array[i]);
  },
  extend: function() {
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
  },
  contains: function(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
  }
};