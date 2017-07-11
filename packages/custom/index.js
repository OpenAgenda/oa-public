"use strict";

const endpoints = {
  get: require( './service/get' ),
  list: require( './service/list' ),
  create: require( './service/create' ),
  update: require( './service/update' ),
  remove: require( './service/remove' )
},

  _ = require( 'lodash' );

module.exports = formSchemaId => {

  return _.mapValues( endpoints, ( v, k ) => v.bind( null, formSchemaId ) );

}

module.exports.init = require( './service/config' ).init;