"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const get = require( './get' );

module.exports = ( options = {} ) => {

  const config = _.assign( {
    knex: null,
    schema: 'network'
  }, options );

  return {
    get: get.bind( null, config )
  }

}
