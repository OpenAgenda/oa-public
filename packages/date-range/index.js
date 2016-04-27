"use strict";

var labels = require( './labels' ),

patterns = require( './patterns' ),

moment = require( 'moment-timezone' ),

utils = require( 'utils' );

module.exports = function( timings, lang, timezone ) {

  if ( [ 'fr', 'en' ].indexOf( lang ) == -1 ) {

    lang = 'en';

  }

  var dateMap = {},

  uniqueDates = [],

  firstDate, lastDate,

  p = patterns(),

  render;

  if ( !timings || !timings.length || ! ( timings instanceof Array ) ) {

    return _render( labels.noDates[ lang ] );    

  }


  timings.forEach( function( t ) {

    var d = moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' );

    dateMap[ d ] = t.start;

    if ( uniqueDates.indexOf( d ) == -1 ) {

      uniqueDates.push( d );

    }

    p.add( t );

  } );

  firstDate = dateMap[ uniqueDates[ 0 ] ];

  lastDate = dateMap[ uniqueDates[ uniqueDates.length - 1 ] ];

  if ( uniqueDates.length == 1 ) {

    return _render( labels.oneDate[ lang ], {
      day: _renderDate( firstDate, false, true, lang, timezone ),
      times: _getTimes( timings, lang, timezone )
    } )

  } else if ( uniqueDates.length == 2 ) {

    return _render( labels.twoDates[ lang ], {
      firstDate: _renderDate( firstDate, lastDate, false, lang, timezone ),
      lastDate: _renderDate( lastDate, firstDate, true, lang )
    } );

  } else {

    return _render( labels.moreDates[ lang ], {
      firstDate: _renderDate( firstDate, lastDate, false, lang, timezone ),
      lastDate: _renderDate( lastDate, firstDate, true, lang, timezone )
    } ) + p.render( ', ' + labels.prefix[ lang ] + ' ', lang );

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


function _renderDate( date, relativeTo, isLast, lang, timezone ) {

  moment.locale( lang );

  var render = { month: true, year: false },

  now = new Date(),

  momentDate = moment.tz( date, timezone ),

  momentRelativeDate = relativeTo ? moment.tz( relativeTo, timezone ) : relativeTo;

  if ( !relativeTo ) {

    render.year = now.getUTCFullYear() !== date.getUTCFullYear();

  } else {

    render.year = date.getUTCFullYear() !== relativeTo.getUTCFullYear() 

                || ( isLast && now.getUTCFullYear() !== date.getUTCFullYear() );

    render.month = render.year || momentDate.month() !== momentRelativeDate.month() || isLast;

  }

  if ( render.year ) {

    return [ momentDate.format( 'D' ), utils.uncapitalize( momentDate.format( 'MMMM' ) ), momentDate.format( 'YYYY' ) ].join( ' ' );;

  } else if ( render.month ) {

    return [ momentDate.format( 'D' ), utils.uncapitalize( momentDate.format( 'MMMM' ) ) ].join( ' ' );

  }

  return momentDate.format( 'D' );

  return rendered;

}



function _pad( str ){

  return ( '0' + str ).slice( -2 );

}


function _getTimes( timings, lang, timezone ) {

  return timings.map( function( timing ) {

    let hours = timing.start.getUTCHours(),

    minutes = timing.start.getUTCMinutes();

    if ( timezone ) {
      
      let t = moment( timing.start );

      hours = t.tz( timezone ).hours();

      minutes = t.tz( timezone ).minutes();
      
    }

    return [ hours, minutes ].map( _pad ).join( labels.minuteSeparator[ lang ] );

  } ).join( ', ' );

}