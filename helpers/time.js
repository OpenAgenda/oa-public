/**
 * format date or objects of dates according to the given format
 */

var moment = require('moment');

module.exports = function( config ) {

  moment.lang(config.lang ? config.lang : 'en');

  return function( date, format ) {

    if ( !format ) format = 'Do MMMM YYYY';

    // date can be an array of dates, one date with a time

    if ( ( typeof date == 'object' ) && !( date instanceof Date ) ) {

      var clean = {};

      for ( var k in date ) {

        clean[k] = formatDate( date[k], format );

      }

      return clean;

    } else {

      return formatDate( date, format );

    }

  };

};

var formatDate = function ( date, format ) {

  if ( !(date instanceof Date)) {

    if (new Date(date) == 'Invalid Date') return date;

  }

  return moment(date).format( format );

};