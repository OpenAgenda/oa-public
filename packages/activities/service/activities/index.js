"use strict";

const _ = require( 'lodash' );

module.exports = ( entityType, entityUid ) => _.mapValues( {
  add: require( './add' ),
  list: require( './list' ),
  get: require( './get' )
}, fn => fn.bind( null, entityType, entityUid ) );
