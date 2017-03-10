"use strict";

const _ = require( 'lodash' );
const add = require( './add' );
const list = require( './list' );
const get = require( './get' );

let config;
let knex;

module.exports = Object.assign( activities, { init } );

function init( { config: c, knex: k } ) {

  config = c;
  knex = k;

  add.init( { config, knex } );
  list.init( { config, knex } );
  get.init( { config, knex } );

}

function activities( entityType, entityUid ) {

  return _.mapValues( {
    add,
    list,
    get
  }, fn => fn.bind( null, entityType, entityUid ) );

}
