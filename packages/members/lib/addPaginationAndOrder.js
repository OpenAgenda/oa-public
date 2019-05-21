"use strict";

const _ = require( 'lodash' );

const cleanNav = require( './cleanNav' );

module.exports = ( k, nav ) => {

  const {
    after,
    offset,
    limit,
    page,
    order
  } = cleanNav( nav );

  const [ orderField, orderDirection ] = order.split( '.' );

  k.orderBy( _.snakeCase( orderField ), orderDirection );

  if ( after ) {
    k.where( _.snakeCase( orderField ), '>', after );
  } else if ( offset ) {
    k.offset( offset );
  } else if ( page ) {
    k.offset( ( page - 1 ) * limit );
  }

  k.limit( limit );

  return {
    orderField
  }

}
