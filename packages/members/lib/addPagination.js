"use strict";

const cleanNav = require( './cleanNav' );

module.exports = ( k, nav ) => {

  const { from, offset, limit, page } = cleanNav( nav );

  if ( from ) {
    k.where( 'id', '>=', from );
  } else if ( offset ) {
    k.offset( offset );
  } else if ( page ) {
    k.offset( ( page - 1 ) * limit );
  }

  k.limit( limit );

}
