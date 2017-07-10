"use strict";

const endpoints = {
  create: require( './service/create' )
},

  _ = require( 'lodash' );

module.exports = formSchemaId => {

  return _.mapValues( endpoints, ( v, k ) => v.bind( null, formSchemaId ) );

}

module.exports.init = require( './service/config' ).init;