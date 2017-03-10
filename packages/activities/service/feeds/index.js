"use strict";

const _ = require( 'lodash' );

module.exports = ( entityType, entityUid ) => _.mapValues( {
  create: require( './create' ),
  get: require( './get' ),
  follow: require( './follow' ),
  unfollow: require( './unfollow' ),
  remove: require( './remove' )
}, fn => fn.bind( null, entityType, entityUid ) );
