"use strict";

const _ = require( 'lodash' );
const get = require( './get' );
const list = require( './list' );
const stream = require( './stream' );
const create = require( './create' );
const patch = require( './patch' );
const remove = require( './remove' );

const utils = {
  roles: require( './lib/roles' ),
  compareRoles: require( './lib/compareRoles' )
}

module.exports = ( options = {} ) => {

  const config = {
    knex: null,
    schema: 'member',
    interfaces: {},
    ... options
  };

  return {
    get: get.bind( null, config ),
    list: list.bind( null, config ),
    create: create.bind( null, config ),
    patch: patch.bind( null, config ),
    remove: remove.bind( null, config ),
    stream: stream.bind( null, config)
  }

}

module.exports.utils = utils;
