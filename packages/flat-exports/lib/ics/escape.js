"use strict";

module.exports = txt => {

  if ( txt === null ) return null;

  return ( txt + '' )

    .replace( /\r/g, ' ' )

    .replace( /\n/g, '\\r\\n' )

    .replace( /,/g, '\\,' )

    .replace( /;/g, '\\;' );

}