/**
 * format date or objects of dates according to the given format
 */

var moment = require( 'moment' );

module.exports = function( config ) {

  var timezone = config.timezone ? config.timezone : '+0200';

  moment.locale(config.lang ? config.lang : 'en');

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

        clean[k] = formatDate( date[k], assumedFormat, timezone );

      }

      return clean;

    } else {

      if ( !format ) format = 'Do MMMM YYYY';

      return formatDate( date, format, timezone );

    }

  };

};

var formatDate = function ( date, format, timezone ) {

  if ( !(date instanceof Date)) {

    if (new Date(date) == 'Invalid Date') return date;

  }

  return moment( date ).zone( timezone ).format( format );

};