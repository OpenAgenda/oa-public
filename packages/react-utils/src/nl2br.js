import React from 'react';

export default function nl2br( str ) {

  const newlineRegex = /(\r\n|\r|\n)/g;

  if ( typeof str === 'number' ) {
    return str;
  } else if ( typeof str !== 'string' ) {
    return '';
  }

  return str.split( newlineRegex ).map( ( line, index ) =>
    line.match( newlineRegex ? React.createElement( 'br', { key: index } ) : line ) );

}
