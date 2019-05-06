"use strict";

const _ = require( 'lodash' );

const task = require( './service/task' );

const endpoints = {
  get: require( './service/get' ),
  list: require( './service/list' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  set: require( './service/set' ),
  remove: require( './service/remove' ),
  transferFromLegacy: require( './service/legacy/transfer' )
};

module.exports = _.assign( formSchemaId => {

  return _.mapValues( endpoints, ( v, k ) => v.bind( null, formSchemaId ) );

}, _.pick( require( './service/config' ), [ 'init', 'shutdown', 'getConfig' ] ), {
  parseLegacy: require( './service/legacy/transfer' ).parse,
  pushLegacyDatasetToCustom: task.pushLegacyDatasetToCustom,
  pushCustomDatasetToLegacy: task.pushCustomDatasetToLegacy,
  task
} );
