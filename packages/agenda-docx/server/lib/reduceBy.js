"use strict";

const _ = require( 'lodash' );

module.exports = ( items, key, opts = {} ) => {

  const options = _.defaults( opts, {
    hoist: [],
    childrenKey: 'items',
    targetKey: key
  } );

  const byKey = {};

  items.forEach( item => {

    const keyValue = _.get( item, key, null );

    if ( byKey[ keyValue ] === undefined ) {

      byKey[ keyValue ] = {}
      byKey[ keyValue ][ options.targetKey ] = keyValue;
      byKey[ keyValue ][ options.childrenKey ] = [];

      options.hoist.forEach( ( { source, target } ) => {

        _.set( byKey[ keyValue ], target, _.get( item, source ) );

      } );

    }

    byKey[ keyValue ][ options.childrenKey ].push( item );

  } );

  return _.keys( byKey ).sort().map( k => byKey[ k ] );

}