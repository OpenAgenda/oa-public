"use strict";

var labels = {
  fr: require( './dateLabels.fr.json' ),
},

lang = 'en',

months = [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december' ];

module.exports = renderLabel;

module.exports.setLang = setLang;

function renderLabel() {

  if ( arguments.length == 2 ) {

    return renderRange( arguments[ 0 ], arguments[ 1 ] );

  } else {

    return renderDate( arguments[ 0 ] );

  }

}

function renderRange( s, e ) {

  var label = 'from %start% to %end%';

  if ( lang !== 'en' ) label = labels[ lang ][ label ];

  return label.replace( '%start%', renderDate( s ) ).replace( '%end%', renderDate( e ) ); 

}

function renderDate( d ) {

  var date = new Date( d ),

  now = new Date(),

  displayYear = date.getFullYear() !== now.getFullYear(),

  month = months[ date.getMonth() ];

  if ( lang !== 'en' ) month = labels[ lang ][ month ];

  return date.getDate() + ' ' + month + ( displayYear ? ' ' + date.getFullYear() : '' );

}


function setLang( l ) {

  lang = l;

}