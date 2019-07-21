"use strict";

const _ = require( 'lodash' );
const get = require( './get' );
const list = require( './list' );
const stream = require( './stream' );
const create = require( './create' );
//const update = require( './update' );
//const validate = require( './validate' );

const utils = {
  roles: require( './lib/roles' ),
  compareRoles: require( './lib/compareRoles' )
}

module.exports = ( options = {} ) => {

  const config = _.assign( {
    knex: null,
    schema: 'member',
    interfaces: {}
  }, options );

  return {
    get: get.bind( null, config ),
    list: list.bind( null, config ),
    create: create.bind( null, config ),
    stream: stream.bind( null, config)
    //create: create.bind( null, config ),
    //update: update.bind( null, config ),
    //patch: update.bind( null, _.assign( { patch: true }, config ) ),
    //validate
  }

}

module.exports.utils = utils;
