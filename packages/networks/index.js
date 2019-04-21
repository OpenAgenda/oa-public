"use strict";

const _ = require( 'lodash' );
const config = require( './config' );
const get = require( './get' );
const list = require( './list' );
const create = require( './create' );
const validate = require( './validate' );

module.exports = ( options = {} ) => {

  const config = _.assign( {
    knex: null,
    schema: 'network'
  }, options );

  return {
    get: get.bind( null, config ),
    list: list.bind( null, config ),
    create: create.bind( null, config ),
    validate
  }

}

module.exports.validate = validate;
