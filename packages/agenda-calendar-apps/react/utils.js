"use strict";

import _ from 'lodash';

module.exports = {
  pickLang,
  getMonthBrackets,
  getMonth
}

function pickLang( multi, preferredLang ) {

  if ( multi[ preferredLang ] ) return multi[ preferredLang ];

  return multi[ _.first( _.keys( multi ) ) ];

}

function getMonth( d ) {

  if ( !d ) d = new Date();

  return [ d.getFullYear(), fZ( d.getMonth() + 1 ) ].join( '-' );

}

function getMonthBrackets( d ) {

  const begin = getMonth( d ) + '-01';

  const end = new Date( begin );

  end.setMonth( end.getMonth() + 1 );

  end.setDate( 0 );

  return [ begin, [ end.getFullYear(), fZ( end.getMonth()+1 ), fZ( end.getDate() ) ].join( '-' ) ];

}

function fZ( n ) {

  return n < 10 ? '0' + n : n;

}