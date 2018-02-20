"use strict";

const _ = require( 'lodash' );
const add = require( './add' );
const list = require( './list' );
const get = require( './get' );

let config;
let knex;
let service;

module.exports = Object.assign( activities, {
  init,
  // global usage, without predefined feed
  add: add.bind( null, null ),
  list: list.bind( null, null ),
  get: get.bind( null, null )
} );

function init( { config: c, knex: k, service: s } ) {

  config = c;
  knex = k;
  service = s;

  add.init( { config, knex, service } );
  list.init( { config, knex, service } );
  get.init( { config, knex, service } );

}

function activities( identifiers ) {

  return _.mapValues( {
    add,
    list,
    get
  }, fn => fn.bind( null, identifiers ) );

}
