"use strict";

const cleanNav = require( './cleanNav' );

module.exports = ( k, nav ) => {

  const { after, offset, limit, page } = cleanNav( nav );

  if ( after ) {
    k.where( 'id', '>', after );
  } else if ( offset ) {
    k.offset( offset );
  } else if ( page ) {
    k.offset( ( page - 1 ) * limit );
  }

  k.limit( limit );

}
