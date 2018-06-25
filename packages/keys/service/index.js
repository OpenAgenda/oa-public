"use strict";

const _ = require( 'lodash' );

const endpoints = {
  create: require( './create' ),
  get: require( './get' ),
  list: require( './list' ),
  update: require( './update' ),
  remove: require( './remove' )
};

module.exports = identifiers => {

  return _.mapValues( endpoints, ( v, k ) => v.bind( null, identifiers ) );

}

module.exports.init = require( './config' ).init;
