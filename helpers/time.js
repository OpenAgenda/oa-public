/**
 * format date or objects of dates according to the given format
 */

var moment = require( 'moment' ),

deepExtend = require( 'deep-extend' );

module.exports = function( options ) {

  var params = deepExtend({
    lang: 'en',
    utc: true
  }, options );

  moment.locale( params.lang );

  return function( date, format ) {

    // date can be an array of dates, one date with a time

    if ( ( typeof date == 'object' ) && !( date instanceof Date ) ) {

      var clean = {}, assumedFormat;

      for ( var k in date ) {

        if ( !format && ( k.indexOf('time') !== -1 ) ) {

          // format is not explicited and key suggests time is required
          assumedFormat = 'HH:mm';

        } else {

          assumedFormat = format ? format : 'Do MMMM YYYY';

        }

        clean[k] = formatDate( date[k], assumedFormat );

      }

      return clean;

    } else {

      if ( !format ) format = 'Do MMMM YYYY';

      return formatDate( date, format );

    }

  };

};

var formatDate = function ( date, format ) {

  if ( !(date instanceof Date)) {

    if (new Date(date) == 'Invalid Date') return date;

  }

  return moment( date ).utc().format( format );

};