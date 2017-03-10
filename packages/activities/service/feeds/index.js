"use strict";

const _ = require( 'lodash' );
const create = require( './create' );
const get = require( './get' );
const follow = require( './follow' );
const unfollow = require( './unfollow' );
const remove = require( './remove' );

let config;
let knex;

module.exports = Object.assign( feeds, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

  create.init( { config, knex } );
  get.init( { config, knex } );
  follow.init( { config, knex } );
  unfollow.init( { config, knex } );
  remove.init( { config, knex } );

}

function feeds( entityType, entityUid ) {

  return _.mapValues( {
    create,
    get,
    follow,
    unfollow,
    remove
  }, fn => fn.bind( null, entityType, entityUid ) );

}

