"use strict";

const _ = require( 'lodash' );

const endpoints = {
  get: require( './service/get' ),
  list: require( './service/list' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  set: require( './service/set' ),
  remove: require( './service/remove' )
};

module.exports = _.extend( formSchemaId => {

  return _.mapValues( endpoints, ( v, k ) => v.bind( null, formSchemaId ) );

}, _.pick( require( './service/config' ), [ 'init', 'shutdown', 'getConfig' ] ) );