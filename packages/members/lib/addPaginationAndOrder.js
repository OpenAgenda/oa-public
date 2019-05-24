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

  if ( _isMonoFieldSeek( after ) ) {
    k.where( 'id', '>', after );
  } else if ( _isMultiFieldSeek( after ) ) {
    k.where( builder => builder
      .where( _.snakeCase( orderField ), _operator( orderDirection ), after[ 0 ] || 0 )
      .whereRaw( `not (${_.snakeCase( orderField )} = ? and id ${_operator( 'desc' )} ?)`, after || 0 )
    );
  } else if ( offset ) {
    k.offset( offset );
  } else if ( page ) {
    k.offset( ( page - 1 ) * limit );
  }

  if ( _isMultiFieldSeek( after ) ) {
    k.orderBy( [ {
      column: _.snakeCase( orderField ),
      order: orderDirection
    }, {
      column: 'id',
      order: 'asc'
    } ] );
  } else {
    k.orderBy( _.snakeCase( orderField ), orderDirection );
  }

  k.limit( limit );

  return {
    orderField
  }

}

function _isMonoFieldSeek( after ) {
  return _.isArray( after ) && after.length === 1;
}

function _isMultiFieldSeek( after ) {
  return _.isArray( after ) && after.length === 2;
}

function _operator( direction, reverse = false ) {
  if ( !reverse ) {
    return direction === 'desc' ? '<=' : '>=';
  } else {
    return direction === 'desc' ? '>=' : '<=';
  }
}
