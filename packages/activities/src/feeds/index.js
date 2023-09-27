"use strict";

const _ = require( 'lodash' );
const create = require( './create' );
const get = require( './get' );
const follow = require( './follow' );
const unfollow = require( './unfollow' );
const remove = require( './remove' );

module.exports = function feeds( config, identifiers ) {

  return _.mapValues( {
    create,
    get,
    follow,
    unfollow,
    remove
  }, fn => fn.bind( null, config, identifiers ) );

};
