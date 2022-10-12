'use strict';

const getTimings = require('./getTimings');

module.exports = instance => {

  var now = new Date(),

  min = [ false, false ]; // past / upcoming

  getTimings(instance).forEach( function( timing ) {
    var end = new Date( timing.end ),

    start = new Date( timing.start );

    if ( end < now ) {

      // past

      if ( !min[0] || ( min[0] < end ) ) {

        min[0] = end;

      }

    } else {

      // upcoming or ongoing

      if ( !min[1] || ( min[1] > start ) ) {

        min[1] = start;

      }

    }
  });

  if ( min[ 1 ] ) return min[ 1 ];

  if ( min[ 0 ] ) return min[ 0 ];

  return false;
}