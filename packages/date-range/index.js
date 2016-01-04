"use strict";

var DateRange = require( './date-range' );

module.exports = function( timings, lang ) {

  return ( new DateRange( timings, { lang: lang } ) ).toString();
  
}