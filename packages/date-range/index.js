"use strict";

var labels = require( './labels' );

/*patterns = [ 'week', 'dayOfMonth' ].map( function( name ) {

  return './patterns/'

})

week = require( './patterns/week' ); */

module.exports = function( timings, lang ) {

  if ( !lang ) lang = 'en';

  var dateMap = {},

  uniqueDates = [],

  firstDate, lastDate;

  if ( !timings || !timings.length ) {

    return _render( labels.noDates[ lang ] );    

  }

  timings.forEach( function( t ) {

    var d = t.start.toISOString().slice( 0, 10 );

    dateMap[ d ] = t.start;

    if ( uniqueDates.indexOf( d ) == -1 ) {

      uniqueDates.push( d );

    }

  } );

  firstDate = dateMap[ uniqueDates[ 0 ] ];

  lastDate = dateMap[ uniqueDates[ uniqueDates.length - 1 ] ];

  if ( uniqueDates.length == 1 ) {

    return _render( labels.oneDate[ lang ], {
      day: _renderDate( firstDate, lang ),
      times: _getTimes( timings, lang )
    } );

  } else if ( uniqueDates.length == 2 ) {

    return _render( labels.twoDates[ lang ], {
      firstDate: _renderDate( firstDate, lastDate, lang ),
      lastDate: _renderDate( lastDate, lang )
    } );

  } else {

    return _render( labels.moreDates[ lang ], {
      firstDate: _renderDate( firstDate, lastDate, lang ),
      lastDate: _renderDate( lastDate, lang )
    } );

  }
  
}


function _render( template, data ){

  var out = template;

  Object.keys( data || {} ).forEach( function( key ) {
    var regex = new RegExp( '%' + key + '%' );
    out = out.replace( regex, data[ key ], 'g' );
  });

  return out;
}


function _renderDate( date, relativeTo, lang ) {

  if ( arguments.length == 2 ) {

    lang = relativeTo;

    relativeTo = false;

  }

  var render = { month: true, year: false },

  now = new Date(),

  rendered = date.getUTCDate();

  if ( !relativeTo ) {

    render.year = now.getUTCFullYear() !== date.getUTCFullYear();

  } else {

    render.year = date.getUTCFullYear() !== relativeTo.getUTCFullYear();

    render.month = render.year || date.getMonth() !== relativeTo.getMonth();

  }

  if ( render.month ) {

    rendered += ' ' + labels.months[ date.getUTCMonth() ][ lang ];

    if ( render.year ) {

      rendered += ' ' + date.getUTCFullYear();

    }

  }

  return rendered;

}



function _pad( str ){

  return ( '0' + str ).slice( -2 );

}


function _getTimes( timings ) {

  return timings.map( function( timing ) {

    return [ timing.start.getUTCHours(), timing.start.getUTCMinutes() ].map( _pad ).join( ':' );

  } ).join( ', ' );

}