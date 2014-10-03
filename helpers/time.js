/**
 * format date or objects of dates according to the given format
 */

var moment = require( 'moment' );

module.exports = function( config ) {

  var timezone = config.timezone ? config.timezone : '+0200';

  moment.locale(config.lang ? config.lang : 'en');

  return function( date, format ) {

    if ( !format ) format = 'Do MMMM YYYY';

    // date can be an array of dates, one date with a time

    if ( ( typeof date == 'object' ) && !( date instanceof Date ) ) {

      var clean = {};

      for ( var k in date ) {

        clean[k] = formatDate( date[k], format, timezone );

      }

      return clean;

    } else {

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