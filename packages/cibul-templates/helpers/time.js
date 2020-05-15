/**
 * format date or objects of dates according to the given format
 */

var moment = require( 'moment-timezone' ),

deepExtend = require( 'deep-extend' );

module.exports = function( options ) {

  var params = deepExtend({
    lang: 'en',
    utc: true
  }, options );

  var process = function( date, format, timezone ) {

    if ( typeof date == 'string' ) {

      try {

        date = JSON.parse( date );

      } catch( e ) {}

    }

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

        clean[ k ] = formatDate( date[ k ], assumedFormat, timezone, params.lang );

      }

      return clean;

    } else {

      if ( !format ) format = 'Do MMMM YYYY';

      return formatDate( date, format, timezone, params.lang );

    }

  };

  process.diff = function( d1, d2 ) {

    var buffer, duration;

    if ( typeof d1 == 'string' ) {

      d1 = new Date( d1 );

    }

    if ( typeof d2 == 'string' ) {

      d2 = new Date( d2 );

    }

    if ( d2 < d1 ) {

      buffer = d1;

      d1 = d2;

      d2 = buffer;

    }

    return moment.duration( d2.getTime() - d1.getTime() );

  };

  return process;

};

var formatDate = function ( date, format, timezone, lang = 'en' ) {

  if ( !(date instanceof Date)) {

    if (new Date(date) == 'Invalid Date') return date;

  }

  if ( timezone ) {

    return moment.tz( date, timezone ).locale( lang ).format( format );

  }

  return moment( date ).utc().locale( lang ).format( format );

};
