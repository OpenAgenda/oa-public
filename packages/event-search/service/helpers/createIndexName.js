"use strict";

module.exports = function( alias ) {

  let d = new Date();

  return alias + '_' + d.getFullYear() + _fZ( d.getMonth() + 1 ) + _fZ( d.getDate() ) + 't' + _fZ( d.getHours() ) + _fZ( d.getMinutes() );

}

function _fZ( n, size ) {

  if ( !size ) size = 2;

  var s = n + '',

  sign = s.substr( 0, 1 ) == '-' ? '-' : '';

  if ( sign.length ) {

    s = s.substr( 1 );

  }

  while ( s.length < size ) s = '0' + s;

  return sign + s; 
}