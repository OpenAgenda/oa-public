"use strict";

const _ = require( 'lodash' );
const create = require( './create' );
const get = require( './get' );
const follow = require( './follow' );
const unfollow = require( './unfollow' );
const remove = require( './remove' );

let config;
let knex;
let service;

module.exports = Object.assign( feeds, { init } );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  create.init( { config, knex, service } );
  get.init( { config, knex, service } );
  follow.init( { config, knex, service } );
  unfollow.init( { config, knex, service } );
  remove.init( { config, knex, service } );

}

function feeds( identifiers ) {

  return _.mapValues( {
    create,
    get,
    follow,
    unfollow,
    remove
  }, fn => fn.bind( null, identifiers ) );

}

