"use strict";

const _ = require( 'lodash' );

module.exports = ( entityType, entityUid ) => _.mapValues( {
  list: require( './list' ),
  get: require( './get' ),
  update: require( './update' ),
  remove: require( './remove' )
}, fn => fn.bind( null, entityType, entityUid ) );
