"use strict";

var labels = require( '@openagenda/labels/agendas/range' ),

patterns = require( './patterns' ),

moment = require( 'moment-timezone' ),

utils = require( '@openagenda/utils' );


const ucfirst = str => str.substr( 0, 1 ).toUpperCase() + str.substr( 1 );


module.exports = function( timings, lang, timezone ) {

  if ( ['fr', 'en', 'ar', 'de', 'it', 'es'].indexOf( lang ) == -1 ) {

    lang = 'en';

  }

  var dateMap = {},

  uniqueDates = [],

  firstDate, lastDate,

  p = patterns(timezone);

  if ( !timings || !timings.length || ! ( timings instanceof Array ) ) {

    return _render( labels.noDates[ lang ] );

  }


  timings.forEach( function( t ) {

    var d = moment.tz( t.start, timezone ).locale(lang).format( 'YYYY-MM-DD' );

    dateMap[ d ] = t.start;

    if ( uniqueDates.indexOf( d ) == -1 ) {

      uniqueDates.push( d );

    }

    p.add( t );

  } );

  firstDate = dateMap[ uniqueDates[ 0 ] ];

  lastDate = dateMap[ uniqueDates[ uniqueDates.length - 1 ] ];

  if ( uniqueDates.length == 1 ) {

    return _render( labels.oneDate[ lang ], {
      day: _renderDate( {
        date: firstDate,
        relativeTo: false,
        isLast: true,
        lang,
        timezone,
        oneDate: true
      } ),
      times: _getTimes( timings, lang, timezone )
    } )

  } else if ( uniqueDates.length == 2 ) {

    return _render( labels.twoDates[ lang ], {
      firstDate: _renderDate( {
        date: firstDate,
        relativeTo: lastDate,
        isLast: false,
        lang,
        timezone,
        oneDate: false
      } ),
      lastDate: _renderDate( {
        date: lastDate,
        relativeTo: firstDate,
        isLast: true,
        lang,
        timezone,
        oneDate: false
      } )
    } );

  } else {

    return _render( labels.moreDates[ lang ], {
      firstDate: _renderDate( {
        date: firstDate,
        relativeTo: lastDate,
        isLast: false,
        lang,
        timezone,
        oneDate: false
      } ),
      lastDate: _renderDate( {
        date: lastDate,
        relativeTo: firstDate,
        isLast: true,
        lang,
        timezone,
        oneDate: false
      } )
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


function _renderDate( { date, relativeTo, isLast, lang, timezone, oneDate } ) {

  var render = { day: oneDate, month: true, year: false },

  now = new Date(),

  momentDate = moment.tz( date, timezone ),

  momentRelativeDate = relativeTo ? moment.tz( relativeTo, timezone ) : relativeTo;

  if ( !relativeTo ) {

    render.year = now.getUTCFullYear() !== date.getUTCFullYear();

  } else {

    render.year = date.getUTCFullYear() !== relativeTo.getUTCFullYear()

                || ( isLast && now.getUTCFullYear() !== date.getUTCFullYear() );

    render.month = render.year || momentDate.month() !== momentRelativeDate.month() || isLast;

  }

  let template = 'D';

  if ( render.day ) template = 'dddd ' + template;
  if ( render.month ) template = template + ' MMMM';
  if ( render.year ) template = template + ' YYYY';

  return ucfirst( momentDate.locale(lang).format( template ) );

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

    return [ hours, minutes ].map( _pad ).join( labels.minuteSeparator[ lang ] );

  } ).join( ', ' );

}
